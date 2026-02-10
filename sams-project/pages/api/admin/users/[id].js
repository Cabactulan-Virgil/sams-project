import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.query;
  const userId = parseInt(id, 10);

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  if (req.method === 'PUT') {
    try {
      const {
        name,
        email,
        password,
        role,
        studentDepartment,
        studentYear,
        teacherProgram,
        teacherCourse,
        teacherLevel,
      } = req.body || {};

      const data = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email;
      if (role !== undefined) data.role = role;
      if (studentDepartment !== undefined) data.studentDepartment = studentDepartment;
      if (studentYear !== undefined) data.studentYear = studentYear;
      if (teacherProgram !== undefined) data.teacherProgram = teacherProgram;
      if (teacherCourse !== undefined) data.teacherCourse = teacherCourse;
      if (teacherLevel !== undefined) data.teacherLevel = teacherLevel;

      if (password !== undefined) {
        const passwordTrimmed = String(password || '').trim();
        if (passwordTrimmed) {
          if (passwordTrimmed.length < 6) {
            return res.status(400).json({
              success: false,
              message: 'Password must be at least 6 characters',
            });
          }
          data.passwordHash = await bcrypt.hash(passwordTrimmed, 10);
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
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

      return res.status(200).json({ success: true, user: updated });
    } catch (error) {
      console.error('Admin update user error', error);
      // Unique email conflict, etc.
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Prevent admin from deleting their own account via this endpoint
      if (authUser.id === userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own admin account',
        });
      }

      await prisma.user.delete({ where: { id: userId } });
      return res.status(204).end();
    } catch (error) {
      console.error('Admin delete user error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
