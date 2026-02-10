import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { studentId, teacherId, subjectId, classId } = req.body || {};

    if (!studentId || !teacherId || !subjectId || !classId) {
      return res.status(400).json({ message: 'studentId, teacherId, subjectId, and classId are required' });
    }

    const studentIdNum = Number(studentId);
    const teacherIdNum = Number(teacherId);
    const subjectIdNum = Number(subjectId);
    const classIdNum = Number(classId);

    if ([studentIdNum, teacherIdNum, subjectIdNum, classIdNum].some(n => Number.isNaN(n))) {
      return res.status(400).json({ message: 'IDs must be valid numbers' });
    }

    try {
      const existing = await prisma.enrollment.findFirst({
        where: {
          student_id: studentIdNum,
          teacher_id: teacherIdNum,
          subject_id: subjectIdNum,
          class_id: classIdNum,
        },
      });

      if (existing) {
        return res.status(409).json({ message: 'Enrollment already exists for this student, teacher, class, and subject' });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          student_id: studentIdNum,
          teacher_id: teacherIdNum,
          subject_id: subjectIdNum,
          class_id: classIdNum,
        },
        select: {
          id: true,
          student_id: true,
          teacher_id: true,
          subject_id: true,
          class_id: true,
          users_enrollment_student_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
              studentDepartment: true,
              studentYear: true,
            },
          },
          users_enrollment_teacher_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subjects: {
            select: { id: true, code: true, name: true },
          },
          classes: {
            select: { id: true, name: true },
          },
        },
      });

      return res.status(201).json({ enrollment });
    } catch (err) {
      console.error('POST /api/admin/enrollments error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
