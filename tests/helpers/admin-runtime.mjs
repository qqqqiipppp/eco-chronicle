// Isolated PostgreSQL + a cryptographically verified Auth contract fixture.
// No production account, password, token, allowlist grant or authentication bypass.
import fs from 'node:fs';import path from 'node:path';import {randomUUID,generateKeyPairSync,sign,verify} from 'node:crypto';
import {database,read,root} from './cloud-save-runtime.mjs';
import {createAdminHandler,createAuthVerifier} from '../../supabase/functions/student-admin/handler.mjs';
export async function adminDatabase(){
  const base=await database(true);
  await base.db.exec('create schema auth;create table auth.users(id uuid primary key);');
  const migration=fs.existsSync(path.join(root,'supabase/admin-schema.sql'))?'supabase/admin-schema.sql':'supabase/migrations/'+fs.readdirSync(path.join(root,'supabase/migrations')).find(f=>f.endsWith('_student_admin_management.sql'));
  await base.db.exec(read(migration));
  const admin=randomUUID(),regular=randomUUID(),disabled=randomUUID();
  for(const id of [admin,regular,disabled])await base.db.query('insert into auth.users(id)values($1)',[id]);
  await base.db.query("insert into public.app_admins(user_id,display_name)values($1,'TEST administrator'),($2,'TEST disabled')",[admin,disabled]);
  await base.db.query('update public.app_admins set disabled_at=now()where user_id=$1',[disabled]);
  const signatures={student_admin_allowed:['p_admin'],student_admin_list:['p_admin','p_query','p_sort','p_filter','p_limit','p_offset'],
    student_admin_get:['p_admin','p_id','p_reveal','p_export'],student_admin_mutate:['p_admin','p_action','p_id','p_expected_revision','p_save_data','p_save_version','p_new_code','p_changed_fields','p_request_id']};
  const rpc=(name,args)=>signatures[name]?base.db.transaction(async tx=>{
    await tx.exec('set local role service_role');const entries=Object.entries(args);
    if(!entries.every(([k])=>signatures[name].includes(k)))throw Error('Unexpected parameter');
    const result=await tx.query('select public.'+name+'('+entries.map(([k],i)=>k+'=>$'+(i+1)).join(',')+') as result',entries.map(([,v])=>typeof v==='object'&&v!==null?JSON.stringify(v):v));
    return result.rows[0].result;
  }):base.rpc(name,args);
  return {...base,rpc,admin,regular,disabled};
}
export function authFixture(setup){
  const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),issuer='https://auth.fixture.invalid/auth/v1';
  const users=new Set([setup.admin,setup.regular,setup.disabled]);
  function token(user,overrides={}){
    const h=Buffer.from(JSON.stringify({alg:'ES256',typ:'JWT'})).toString('base64url');
    const p=Buffer.from(JSON.stringify({sub:user,iss:issuer,role:'authenticated',exp:Math.floor(Date.now()/1000)+300,...overrides})).toString('base64url');
    return h+'.'+p+'.'+sign('sha256',Buffer.from(h+'.'+p),{key:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64url');
  }
  const verifier=createAuthVerifier({url:'https://auth.fixture.invalid',key:'sb_publishable_admin_test',fetcher:async(url,args)=>{
    try{
      if(url!=='https://auth.fixture.invalid/auth/v1/user'||args.headers.apikey!=='sb_publishable_admin_test')throw Error();
      const [h,p,s]=(args.headers.Authorization||'').slice(7).split('.'),payload=JSON.parse(Buffer.from(p,'base64url'));
      if(JSON.parse(Buffer.from(h,'base64url')).alg!=='ES256'||!verify('sha256',Buffer.from(h+'.'+p),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(s,'base64url'))||payload.iss!==issuer||payload.exp<=Date.now()/1000||!users.has(payload.sub)||payload.role!=='authenticated')throw Error();
      return Response.json({id:payload.sub,is_anonymous:false,user_metadata:payload.user_metadata||{}});
    }catch(_){return Response.json({error:'invalid token'},{status:401});}
  }});
  return {token,verifier};
}
export function adminApi(setup,settings={}){
  const auth=authFixture(setup),logs=[];
  const handler=createAdminHandler({rpc:setup.rpc,verifyUser:auth.verifier,publicKeys:['sb_publishable_admin_test'],allowedOrigins:['https://admin.fixture.invalid'],logger:{error(...args){logs.push(args);}},...settings});
  async function call(body,token=auth.token(setup.admin),extra={}){
    const headers={apikey:'sb_publishable_admin_test','Content-Type':'application/json',Origin:'https://admin.fixture.invalid',...extra};if(token)headers.Authorization='Bearer '+token;
    const response=await handler(new Request('https://admin.fixture.invalid/functions/v1/student-admin',{method:'POST',headers,body:JSON.stringify(body)}));
    return {...await response.json(),status:response.status};
  }
  return {handler,call,...auth,logs};
}
