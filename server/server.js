/**
 * Backend Mínimo Seguro con Node.js / Express (server/server.js)
 * Provee autenticación con tokens JWT y persistencia de menú.
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'restoapp_secret_key_change_in_production';

// Base de datos en memoria para el servidor mínimo
let menuDB = [
  { id: '1', name: 'Hamburguesa Artesanal', price: 22000 },
  { id: '2', name: 'Pizza Margarita', price: 28000 },
  { id: '3', name: 'Ensalada César', price: 18000 }
];

// Usuarios válidos (en producción usar base de datos con hashes bcrypt)
const USERS_DB = {
  'admin@restoapp.com': { passwordHash: 'admin123', role: 'ADMIN' }
};

function generarToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 3600000 })).toString('base64url');
  const signature = Buffer.from(`${header}.${body}.${JWT_SECRET}`).toString('base64url');
  return `${header}.${body}.${signature}`;
}

function verificarToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = Buffer.from(`${header}.${body}.${JWT_SECRET}`).toString('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // 1. GET /api/menu (Público)
  if (req.method === 'GET' && parsedUrl.pathname === '/api/menu') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(menuDB));
    return;
  }

  // 2. POST /api/auth/login (Autenticación en backend)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const user = USERS_DB[email];

        if (user && user.passwordHash === password) {
          const token = generarToken({ sub: email, role: user.role });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token, user: { email, role: user.role } }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Credenciales inválidas.' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Payload inválido.' }));
      }
    });
    return;
  }

  // 3. POST /api/menu (Protegido por Token)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/menu') {
    const userPayload = verificarToken(req.headers['authorization']);
    if (!userPayload) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acceso no autorizado. Token inválido o expirado.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, price } = JSON.parse(body);
        if (!name || isNaN(price) || price <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Datos de plato inválidos.' }));
          return;
        }
        const nuevoPlato = { id: String(Date.now()), name: name.trim(), price: Number(price) };
        menuDB.push(nuevoPlato);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(nuevoPlato));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error procesando JSON.' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada.' }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[RestoApp Backend] Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

module.exports = server;
