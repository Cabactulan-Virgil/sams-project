import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';
import { sendAdminNewUserEmail } from '../../../../lib/email';

const ALLOWED_ROLES = ['student', 'teacher', 'program_head'];

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can manage users',
    });
  }

  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        orderBy: { id: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          teacherProgram: true,
          teacherCourse: true,
          teacherLevel: true,
          studentDepartment: true,
          studentYear: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        users,
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

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

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and role are required',
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for admin-created user',
      });
    }

    if (role === 'student') {
      if (!studentDepartment || !studentYear) {
        return res.status(400).json({
          success: false,
          message: 'Please provide department and year for students',
        });
      }
    }

    if (role === 'teacher' || role === 'program_head') {
      if (!teacherCourse || !teacherLevel) {
        return res.status(400).json({
          success: false,
          message: 'Please provide course and level for teachers',
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

    const passwordToUse = password && password.length >= 6 ? password : 'password123';
    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        teacherProgram: role === 'teacher' || role === 'program_head' ? teacherProgram || null : null,
        teacherCourse: role === 'teacher' || role === 'program_head' ? teacherCourse || null : null,
        teacherLevel: role === 'teacher' || role === 'program_head' ? teacherLevel || null : null,
        studentDepartment: role === 'student' ? studentDepartment || null : null,
        studentYear: role === 'student' ? studentYear || null : null,
      },
    });

    const notificationMessage =
      role === 'student'
        ? `New Student registered — ${user.name}`
        : role === 'program_head'
          ? `New Program Head registered — ${user.name}`
          : `New Teacher registered — ${user.name}`;

    let notification = null;
    if (prisma.notification?.create) {
      notification = await prisma.notification.create({
        data: {
          message: notificationMessage,
          studentId: role === 'student' ? user.id : null,
          teacherId: role === 'teacher' || role === 'program_head' ? user.id : null,
          type: 'registration',
        },
      });
    }

    await sendAdminNewUserEmail({
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teacherCourse: user.teacherCourse,
        teacherLevel: user.teacherLevel,
        studentDepartment: user.studentDepartment,
        studentYear: user.studentYear,
      },
      notification,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Admin create user error', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
    });

    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      success: false,
      message: isProd ? 'Internal server error' : error?.message || 'Internal server error',
      code: isProd ? undefined : error?.code,
    });
  }
}
