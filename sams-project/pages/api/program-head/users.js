import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

const ALLOWED_ROLES = ['student', 'teacher'];

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'program_head') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const program = user.teacherProgram || null;

  try {
    if (req.method === 'GET') {
      const [students, teachers] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: 'student',
            ...(program ? { studentDepartment: program } : {}),
          },
          orderBy: { id: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentDepartment: true,
            studentYear: true,
            createdAt: true,
          },
        }),
        prisma.user.findMany({
          where: {
            role: 'teacher',
            ...(program ? { teacherProgram: program } : {}),
          },
          orderBy: { id: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            teacherProgram: true,
            teacherCourse: true,
            teacherLevel: true,
            createdAt: true,
          },
        }),
      ]);

      return res.status(200).json({
        users: [...teachers, ...students],
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const {
      name,
      email,
      password,
      role,
      studentYear,
      teacherCourse,
      teacherLevel,
    } = req.body || {};

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'name, email, and role are required' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordToUse = password && String(password).trim().length >= 6 ? String(password).trim() : 'password123';
    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    if (role === 'student') {
      const created = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'student',
          studentDepartment: program,
          studentYear: studentYear || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studentDepartment: true,
          studentYear: true,
          createdAt: true,
        },
      });

      return res.status(201).json({ user: created });
    }

    if (!teacherCourse || !teacherLevel) {
      return res.status(400).json({ message: 'teacherCourse and teacherLevel are required' });
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'teacher',
        teacherProgram: program,
        teacherCourse,
        teacherLevel,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teacherProgram: true,
        teacherCourse: true,
        teacherLevel: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user: created });
  } catch (err) {
    console.error('Program head users API error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
