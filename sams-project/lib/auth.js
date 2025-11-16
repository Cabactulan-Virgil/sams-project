import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in .env');

// Sign a JWT token with user data
export function signAuthToken(payload) {
  const header = { typ: 'JWT', alg: 'HS256' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify and decode a JWT token
export function verifyAuthToken(token) {
  if (!token) return null;
  
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64');
      
    if (signature !== expectedSignature) return null;
    
    return JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8'));
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Set auth cookie with JWT token
export function buildAuthCookie(token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure; ' : '';
  const sameSite = isProduction ? 'Lax' : 'Strict';
  
  return `auth=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=${sameSite}; Max-Age=604800`; // 7 days
}

// Clear auth cookie
export function clearAuthCookie() {
  return 'auth=; Path=/; HttpOnly; Max-Age=0';
}

// Get user from request cookies
export function getUserFromRequest(req) {
  try {
    const cookie = req?.headers?.cookie || '';
    const match = cookie.match(/auth=([^;]+)/);
    return match ? verifyAuthToken(match[1]) : null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
