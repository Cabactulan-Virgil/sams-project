import { getUserFromRequest } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'program_head') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const userId = Number.parseInt(String(id), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const program = user.teacherProgram || null;

  // GET single user (for future use)
  if (req.method === 'GET') {
    try {
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          AND: [
            {
              OR: [
                { role: 'student', studentDepartment: program },
                { role: 'teacher', teacherProgram: program },
              ],
            },
          ],
        },
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

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found or access denied' });
      }

      return res.status(200).json({ user: targetUser });
    } catch (error) {
      console.error('Program head get user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUT update user
  if (req.method === 'PUT') {
    try {
      const { name, email, password, role, studentYear, teacherCourse, teacherLevel } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Name, email, and role are required' });
      }

      // Check if user exists and is within program head's scope
      const existingUser = await prisma.user.findFirst({
        where: {
          id: userId,
          AND: [
            {
              OR: [
                { role: 'student', studentDepartment: program },
                { role: 'teacher', teacherProgram: program },
              ],
            },
          ],
        },
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User not found or access denied' });
      }

      // Check if email is already taken by another user
      if (email !== existingUser.email) {
        const emailCheck = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: userId },
          },
        });
        if (emailCheck) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      const updateData = {
        name,
        email,
        role,
      };

      // Add role-specific fields
      if (role === 'student') {
        updateData.studentDepartment = program;
        if (studentYear !== undefined) updateData.studentYear = studentYear;
        // Clear teacher fields if switching from teacher to student
        updateData.teacherProgram = null;
        updateData.teacherCourse = null;
        updateData.teacherLevel = null;
      } else if (role === 'teacher') {
        updateData.teacherProgram = program;
        if (teacherCourse !== undefined) updateData.teacherCourse = teacherCourse;
        if (teacherLevel !== undefined) updateData.teacherLevel = teacherLevel;
        // Clear student fields if switching from student to teacher
        updateData.studentDepartment = null;
        updateData.studentYear = null;
      }

      // Update password if provided
      if (password && password.trim()) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
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

      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Program head update user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // DELETE user
  if (req.method === 'DELETE') {
    try {
      // Check if user exists and is within program head's scope
      const existingUser = await prisma.user.findFirst({
        where: {
          id: userId,
          AND: [
            {
              OR: [
                { role: 'student', studentDepartment: program },
                { role: 'teacher', teacherProgram: program },
              ],
            },
          ],
        },
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User not found or access denied' });
      }

      // Prevent deletion of admin users or program heads
      if (existingUser.role === 'admin' || existingUser.role === 'program_head') {
        return res.status(403).json({ message: 'Cannot delete admin or program head users' });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Program head delete user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
