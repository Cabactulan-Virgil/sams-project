import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { buildAuthCookie, signAuthToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = signAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', buildAuthCookie(token));

    // Return user data (without sensitive info)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Determine redirect path based on role
    const redirectTo = {
      admin: '/admin',
      teacher: '/teacher',
      program_head: '/program-head',
      student: '/student',
    }[user.role] || '/';

    return res.status(200).json({
      success: true,
      user: userData,
      redirectTo,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
}
