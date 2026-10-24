import {createAdminHandler,createAuthVerifier,createRpc} from './handler.mjs';
function keys(name:string):Record<string,string>{try{return JSON.parse(Deno.env.get(name)||'{}');}catch{return {};}}
const url=Deno.env.get('SUPABASE_URL'),backendKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||keys('SUPABASE_SECRET_KEYS').default;
const publicKeys=[Deno.env.get('CLOUD_SAVE_PUBLIC_KEY'),Deno.env.get('SUPABASE_ANON_KEY'),...Object.values(keys('SUPABASE_PUBLISHABLE_KEYS'))].filter(Boolean);
const origins=(Deno.env.get('CLOUD_SAVE_ALLOWED_ORIGINS')||'https://qqqqiipppp.github.io').split(',').map(v=>v.trim()).filter(v=>/^https?:\/\//.test(v));
Deno.serve(createAdminHandler({rpc:url&&backendKey?createRpc({url,key:backendKey}):null,
  verifyUser:url&&publicKeys[0]?createAuthVerifier({url,key:publicKeys[0]}):null,publicKeys,allowedOrigins:origins}));
