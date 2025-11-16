import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { buildAuthCookie, signAuthToken } from '../../../lib/auth';

const ALLOWED_ROLES = ['student', 'teacher', 'admin'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }

  const ALLOWED_ROLES = ['admin', 'teacher', 'student'];
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    const payload = {
      id: result.insertId,
      name,
      email,
      role,
    };

    // Generate JWT token
    const token = signAuthToken(payload);

    // Set cookie
    res.setHeader('Set-Cookie', buildAuthCookie(token));

    let redirectTo = '/';
    if (role === 'admin') redirectTo = '/admin';
    if (role === 'teacher') redirectTo = '/teacher';
    if (role === 'student') redirectTo = '/student';

    return res.status(201).json({ user: payload, redirectTo });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
