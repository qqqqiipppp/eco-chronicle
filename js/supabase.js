/* Optional connection check only. The game does not depend on this client. */
(function () {
  'use strict';

  var projectUrl = 'https://akpkwypxupghvcghywab.supabase.co';
  // Public browser key, not a service_role/secret key or a database password.
  var publishableKey = 'sb_publishable_8p_lpzKpnJMKweoy_9V0-g_4yufqBBO';
  var connection = { client: null, status: 'initializing', error: null };
  window.ecoSupabase = connection;

  async function initialize() {
    var timer;
    try {
      var url;
      try {
        url = new URL(projectUrl);
      } catch (_) {
        throw new Error('Invalid project URL. Check the Supabase Project URL.');
      }
      if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
        throw new Error('Invalid project URL: use the HTTPS project origin only.');
      }
      if (!publishableKey.startsWith('sb_publishable_')) {
        throw new Error('Invalid key: a browser publishable key is required.');
      }
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('Supabase CDN unavailable. Check network, CSP, or CDN loading.');
      }

      connection.client = window.supabase.createClient(url.origin, publishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      connection.status = 'testing';
      console.info('[Supabase] client initialized');

      // Read bucket metadata only; no objects, game tables, or user data are read/written.
      // An empty list is valid: this public client may have no visible buckets.
      var result = await Promise.race([
        connection.client.storage.listBuckets({ limit: 1 }),
        new Promise(function (_, reject) {
          timer = setTimeout(function () {
            reject(new Error('Connection test timed out after 12 seconds. Check network/project availability.'));
          }, 12000);
        })
      ]);
      if (result.error) throw result.error;
      if (!Array.isArray(result.data)) throw new Error('Unexpected connection test response.');
      connection.status = 'connected';
      console.info('[Supabase] connection test success');
    } catch (error) {
      var status = error && (error.statusCode || error.status);
      var message = error && error.message ? error.message : String(error);
      var hint = status == 401 ? 'Check the publishable key and its project URL.' :
        status == 403 ? 'The read-only test was denied. Check project access policies.' :
        'Check URL, network/CORS, CDN initialization, and project availability.';
      connection.status = 'failed';
      connection.error = { status: status || null, message: message };
      console.error('[Supabase] connection test failed' + (status ? ' (HTTP ' + status + ')' : '') +
        ': ' + message + ' ' + hint);
    } finally {
      clearTimeout(timer);
    }
  }

  // Every initialization/test failure is handled locally; no game state is touched.
  initialize();
})();
