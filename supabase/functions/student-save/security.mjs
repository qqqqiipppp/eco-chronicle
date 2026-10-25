// Server-only capabilities and pseudonymous rate-limit identities. No student data in tokens.
const enc = new TextEncoder();
const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
export function createSecurity(secret, {now = Date.now} = {}) {
  if (typeof secret !== 'string' || secret.length < 32) throw Error('MISSING_SERVER_SECRET');
  const key = crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']);
  async function digest(value) {return hex(new Uint8Array(await crypto.subtle.sign('HMAC', await key, enc.encode(value))));}
  async function identities(request, code) {
    // Supabase's proxy supplies the forwarding chain; global/code budgets also cover IP rotation.
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown').split(',')[0].trim().slice(0,128);
    const device = (request.headers.get('x-eco-device') || 'unknown').slice(0,128);
    return {ip:await digest('ip:'+ip), device:await digest('device:'+device), code:await digest('code:'+code)};
  }
  async function issue(code, device) {
    const expires = Math.floor(now()/1000) + 30*86400;
    const payload = 'v1.'+expires+'.'+await digest('binding:'+code+':'+device);
    return payload+'.'+await digest('resume:'+payload);
  }
  async function verify(token, code, device) {
    if (typeof token !== 'string' || !/^v1\.\d{10}\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return false;
    const [v,exp,binding,sig] = token.split('.'), seconds = Math.floor(now()/1000);
    if (+exp < seconds || +exp > seconds+30*86400 || binding !== await digest('binding:'+code+':'+device)) return false;
    const bytes = new Uint8Array(sig.match(/../g).map(b=>parseInt(b,16)));
    return crypto.subtle.verify('HMAC', await key, bytes, enc.encode('resume:'+[v,exp,binding].join('.')));
  }
  return {identities, issue, verify};
}
