import {createHandler, createRpc} from './handler.mjs';

function keyMap(name: string): Record<string, string> {
  try { return JSON.parse(Deno.env.get(name) || '{}'); } catch { return {}; }
}
const url = Deno.env.get('SUPABASE_URL');
// These values exist ONLY in the Edge runtime, never in GitHub Pages files.
const backendKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || keyMap('SUPABASE_SECRET_KEYS').default;
const publicKeys = [Deno.env.get('CLOUD_SAVE_PUBLIC_KEY'), Deno.env.get('SUPABASE_ANON_KEY'),
  ...Object.values(keyMap('SUPABASE_PUBLISHABLE_KEYS'))];
const allowedOrigins = (Deno.env.get('CLOUD_SAVE_ALLOWED_ORIGINS') || 'https://qqqqiipppp.github.io')
  .split(',').map(value => value.trim()).filter(value => /^https?:\/\//.test(value));

Deno.serve(createHandler({
  rpc: url && backendKey ? createRpc({url, key:backendKey}) : null,
  publicKeys,
  allowedOrigins
}));
