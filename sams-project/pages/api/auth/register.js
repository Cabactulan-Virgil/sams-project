import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';
import { buildAuthCookie } from '../../../lib/auth';

const ALLOWED_ROLES = ['admin', 'teacher', 'student'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required' });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existing = await query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    const userId = result.insertId;

    const payload = {
      id: userId,
      name,
      email,
      role,
    };

    res.setHeader('Set-Cookie', buildAuthCookie(payload));

    let redirectTo = '/';
    if (role === 'admin') {
      redirectTo = '/admin';
    } else if (role === 'teacher') {
      redirectTo = '/teacher';
    } else if (role === 'student') {
      redirectTo = '/student';
    }

    return res.status(201).json({ user: payload, redirectTo });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
