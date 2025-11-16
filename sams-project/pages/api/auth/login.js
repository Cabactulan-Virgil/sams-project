import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';
import { buildAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const users = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.setHeader('Set-Cookie', buildAuthCookie(payload));

    let redirectTo = '/';
    if (user.role === 'admin') {
      redirectTo = '/admin';
    } else if (user.role === 'teacher') {
      redirectTo = '/teacher';
    } else if (user.role === 'student') {
      redirectTo = '/student';
    }

    return res.status(200).json({ user: payload, redirectTo });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
