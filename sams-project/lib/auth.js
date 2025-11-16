import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me-in-production';

function signAuthToken(payload) {
  const json = JSON.stringify(payload);
  const base = Buffer.from(json, 'utf8').toString('base64');
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(base).digest('base64');
  const token = `${base}.${hmac}`;
  return encodeURIComponent(token);
}

function verifyAuthToken(token) {
  if (!token) return null;

  try {
    const decoded = decodeURIComponent(token);
    const parts = decoded.split('.');
    if (parts.length !== 2) return null;

    const [base, sig] = parts;
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(base).digest('base64');
    if (sig !== expected) return null;

    const json = Buffer.from(base, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

function buildAuthCookie(payload) {
  const token = signAuthToken(payload);
  const maxAge = 60 * 60 * 24 * 7;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `auth_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `auth_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function getUserFromRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const pair = cookies.find(c => c.startsWith('auth_token='));
  if (!pair) return null;
  const token = pair.substring('auth_token='.length);
  return verifyAuthToken(token);
}

export { signAuthToken, verifyAuthToken, buildAuthCookie, clearAuthCookie, getUserFromRequest };
