import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { buildAuthCookie, signAuthToken } from '../../../lib/auth';

const ALLOWED_ROLES = ['student', 'teacher'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const {
      name,
      email,
      password,
      role,
      teacherProgram,
      teacherCourse,
      teacherLevel,
      studentDepartment,
      studentYear,
    } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (role === 'teacher') {
      if (!teacherProgram || !teacherCourse || !teacherLevel) {
        return res.status(400).json({
          success: false,
          message: 'Please provide program, course, and level for teachers',
        });
      }
    }

    if (role === 'student') {
      if (!studentDepartment || !studentYear) {
        return res.status(400).json({
          success: false,
          message: 'Please provide department and year for students',
        });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        teacherProgram: role === 'teacher' ? teacherProgram : null,
        teacherCourse: role === 'teacher' ? teacherCourse : null,
        teacherLevel: role === 'teacher' ? teacherLevel : null,
        studentDepartment: role === 'student' ? studentDepartment : null,
        studentYear: role === 'student' ? studentYear : null,
      },
    });

    const notificationMessage =
      role === 'student'
        ? `New Student registered — ${user.name}`
        : role === 'teacher'
        ? `New Teacher registered — ${user.name}`
        : null;

    if (notificationMessage) {
      try {
        await prisma.notification.create({
          data: {
            message: notificationMessage,
            studentId: role === 'student' ? user.id : null,
            teacherId: role === 'teacher' ? user.id : null,
            type: 'registration',
          },
        });
      } catch (notificationError) {
        console.error('Failed to create registration notification', notificationError);
      }
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = signAuthToken(payload);
    res.setHeader('Set-Cookie', buildAuthCookie(token));

    let redirectTo = '/';
    if (role === 'admin') redirectTo = '/admin';
    if (role === 'teacher') redirectTo = '/teacher';
    if (role === 'student') redirectTo = '/student';

    return res.status(201).json({
      success: true,
      user: payload,
      redirectTo,
    });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
