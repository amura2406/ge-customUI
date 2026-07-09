const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- Load local .env if it exists (zero-dependency) ----
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        // Remove surrounding quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (err) {
  console.warn('Error reading .env file:', err.message);
}

const PORT = process.env.PORT || 3400;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---- Helper to get protocol (http/https), respecting reverse proxies ----
function getProtocol(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (forwardedProto) return forwardedProto;

  const host = req.headers.host || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http';
  }
  return 'https';
}

// ---- Google OAuth Environment Config ----
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// ---- Helper to parse cookies ----
function getCookie(req, name) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  cookieHeader.split(';').forEach(cookie => {
    let [partsName, ...rest] = cookie.split('=');
    partsName = partsName.trim();
    if (!partsName) return;
    const val = rest.join('=');
    list[partsName] = val;
  });

  return list[name] ? decodeURIComponent(list[name]) : null;
}

// ---- Auth Config Handler ----
function handleAuthConfig(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    isConfigured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    projectNumber: process.env.GOOGLE_PROJECT_NUMBER || ''
  }));
}

// ---- Auth Login Handler ----
function handleAuthLogin(req, res, parsedUrl) {
  const query = parsedUrl.searchParams;
  const clientId = query.get('client_id') || GOOGLE_CLIENT_ID;
  const clientSecret = query.get('client_secret') || GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Missing Client ID' }));
  }

  const scope = query.get('scope') || 'https://www.googleapis.com/auth/cloud-platform';
  const protocol = getProtocol(req);
  const redirectUri = `${protocol}://${req.headers.host}/oauth2callback`;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.writeHead(302, {
    Location: authUrl,
    'Set-Cookie': [
      `oauth_client_id=${encodeURIComponent(clientId)}; Path=/; HttpOnly; SameSite=Lax`,
      `oauth_client_secret=${encodeURIComponent(clientSecret)}; Path=/; HttpOnly; SameSite=Lax`
    ]
  });
  res.end();
}

// ---- Auth Callback Handler ----
async function handleAuthCallback(req, res, parsedUrl) {
  const query = parsedUrl.searchParams;
  const code = query.get('code');
  const error = query.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end(`<h2>Authentication error: ${error}</h2><a href="/">Back to Home</a>`);
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end(`<h2>Missing authorization code</h2><a href="/">Back to Home</a>`);
  }

  const clientId = getCookie(req, 'oauth_client_id') || GOOGLE_CLIENT_ID;
  const clientSecret = getCookie(req, 'oauth_client_secret') || GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end(`<h2>Missing client credentials. Please try logging in again.</h2><a href="/">Back to Home</a>`);
  }

  const protocol = getProtocol(req);
  const redirectUri = `${protocol}://${req.headers.host}/oauth2callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(data.error_description || data.error || 'Failed to exchange token');
    }

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Set-Cookie': [
        'oauth_client_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        'oauth_client_secret=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
      ]
    });

    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Successful</title>
  <style>
    body {
      background-color: #0f1117;
      color: #e6e8ee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #181b24;
      border: 1px solid #2c3140;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      max-width: 420px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }
    h2 { color: #4ade80; margin: 0 0 12px; font-size: 24px; }
    p { color: #9aa1b2; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .loader {
      border: 3px solid #2c3140;
      border-top: 3px solid #6c9eff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Access Authorized</h2>
    <p>Your Google account has been successfully verified. Saving credentials and redirecting to API Explorer...</p>
    <div class="loader"></div>
  </div>
  <script>
    localStorage.setItem('ge-access-token', '${data.access_token}');
    if ('${data.refresh_token || ''}') {
      localStorage.setItem('ge-refresh-token', '${data.refresh_token || ''}');
    }
    localStorage.setItem('ge-token-expiry', '${Date.now() + (data.expires_in || 3600) * 1000}');
    localStorage.setItem('ge-client-id', '${clientId}');
    localStorage.setItem('ge-client-secret', '${clientSecret}');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  </script>
</body>
</html>
    `);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h2>Token Exchange Failed</h2><p>${err.message}</p><a href="/">Back to Home</a>`);
  }
}

// ---- Auth Refresh Handler ----
async function handleAuthRefresh(req, res) {
  let payload = '';
  req.on('data', (chunk) => { payload += chunk; });
  req.on('end', async () => {
    try {
      const { refresh_token, client_id, client_secret } = JSON.parse(payload);
      if (!refresh_token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing refresh_token' }));
      }

      const clientId = client_id || GOOGLE_CLIENT_ID;
      const clientSecret = client_secret || GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing client credentials' }));
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token,
          grant_type: 'refresh_token'
        }).toString()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Failed to refresh token');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token || refresh_token
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// ---- Proxy handler ----
const MAX_PAYLOAD = 5 * 1024 * 1024; // 5 MB
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']);

async function handleProxy(req, res) {
  // CSRF protection
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    res.writeHead(415, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Content-Type must be application/json' }));
  }
  const origin = req.headers.origin;
  if (origin) {
    const protocol = getProtocol(req);
    const expectedOrigin = `${protocol}://${req.headers.host}`;
    if (origin !== expectedOrigin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Cross-origin requests are not allowed' }));
    }
  }

  // Extract client bearer token
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Unauthorized: Missing or invalid Google Web token' }));
  }
  const token = authHeader.substring(7);

  let payload = '';
  let tooLarge = false;
  req.on('data', (c) => {
    payload += c;
    if (payload.length > MAX_PAYLOAD && !tooLarge) {
      tooLarge = true;
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload too large' }));
      req.destroy();
    }
  });
  req.on('end', async () => {
    if (tooLarge) return;
    let target;
    try {
      target = JSON.parse(payload);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }

    const { url, method = 'GET', body, project } = target;
    if (!url || !/^https:\/\/([a-z0-9]+(-[a-z0-9]+)*-)?discoveryengine\.googleapis\.com\//.test(url)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'URL must target discoveryengine.googleapis.com' }));
    }
    if (!ALLOWED_METHODS.has(method)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method not allowed: ' + method }));
    }

    try {
      const upstream = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(project ? { 'X-Goog-User-Project': project } : {}),
        },
        body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      });

      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Transfer-Encoding': 'chunked',
      });

      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } catch (e) {
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upstream request failed: ' + e.message }));
    }
  });
}

// ---- Static file serving ----
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && pathname === '/api/proxy') {
      return handleProxy(req, res);
    }
    if (pathname === '/api/auth/config') {
      return handleAuthConfig(req, res);
    }
    if (pathname === '/api/auth/login') {
      return handleAuthLogin(req, res, parsedUrl);
    }
    if (pathname === '/oauth2callback') {
      return handleAuthCallback(req, res, parsedUrl);
    }
    if (req.method === 'POST' && pathname === '/api/auth/refresh') {
      return handleAuthRefresh(req, res);
    }
    serveStatic(req, res);
  })
  .listen(PORT, HOST, () => {
    console.log(`GE API Explorer running at http://${HOST}:${PORT}`);
    console.log('Auth: Google Web OAuth 2.0 Enabled.');
  });
