// Read/denial probes only. No real user login, student data retrieval or writes.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={};c.window=c;vm.runInNewContext(fs.readFileSync(new URL('../js/admin-config.js',import.meta.url),'utf8'),c);
const {projectUrl,publishableKey}=c.EcoAdminConfig,origin='https://qqqqiipppp.github.io';
async function probe(label,pathname,options={}){
  const response=await fetch(projectUrl+pathname,{...options,headers:{apikey:publishableKey,Origin:origin,...options.headers},signal:AbortSignal.timeout(15000)});
  const text=await response.text();assert.ok([401,403].includes(response.status),label+' must deny access');
  console.log(JSON.stringify({probe:label,status:response.status,denied:true}));return text;
}
for(const [label,authorization] of [['no JWT',null],['publishable key only','Bearer '+publishableKey],['fake JWT','Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJub3QtYS11c2VyIn0.invalid'],['student code as JWT','Bearer EC-2222-3333']]){
  await probe(label,'/functions/v1/student-admin',{method:'POST',headers:{'Content-Type':'application/json',...(authorization?{Authorization:authorization}:{})},body:JSON.stringify({action:'list'})});
}
for(const table of ['app_admins','student_save_admin_backups','student_admin_audit'])await probe('direct table '+table,'/rest/v1/'+table+'?select=*&limit=0');
await probe('direct admin RPC','/rest/v1/rpc/student_admin_list',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_admin:'00000000-0000-4000-8000-000000000000'})});
