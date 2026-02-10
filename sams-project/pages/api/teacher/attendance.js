import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

function normalizeAttendanceStatus(status) {
  if (!status) return status;
  const s = String(status).trim().toLowerCase();
  if (s === 'present') return 'present';
  if (s === 'late') return 'late';
  if (s === 'absent') return 'absent';
  return status;
}

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'teacher') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { classId, subjectId } = req.query;

    if (!classId || !subjectId) {
      return res.status(400).json({ message: 'classId and subjectId are required' });
    }

    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          teacher_id: user.id,
          class_id: Number(classId),
          subject_id: Number(subjectId),
        },
        include: {
          users_enrollment_student_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
              studentDepartment: true,
              studentYear: true,
            },
          },
        },
      });

      const students = enrollments.map(e => ({
        enrollmentId: e.id,
        studentId: e.student_id,
        name: e.users_enrollment_student_idTousers.name,
        email: e.users_enrollment_student_idTousers.email,
        department: e.users_enrollment_student_idTousers.studentDepartment,
        year: e.users_enrollment_student_idTousers.studentYear,
      }));

      return res.status(200).json({ students });
    } catch (err) {
      console.error('GET /api/teacher/attendance error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { date, records } = req.body || {};

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'date and records are required' });
    }

    const jsDate = new Date(date);
    if (Number.isNaN(jsDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const enrollmentIds = records.map(r => r.enrollmentId).filter(Boolean);
    if (enrollmentIds.length === 0) {
      return res.status(400).json({ message: 'records must include enrollmentId values' });
    }

    try {
      const allowedEnrollments = await prisma.enrollment.findMany({
        where: {
          teacher_id: user.id,
          id: { in: enrollmentIds },
        },
        select: { id: true },
      });

      const allowedIds = new Set(allowedEnrollments.map(e => e.id));

      const writes = records
        .filter(r => allowedIds.has(r.enrollmentId))
        .map(r =>
          prisma.attendance.upsert({
            where: {
              enrollment_id_attendance_date: {
                enrollment_id: r.enrollmentId,
                attendance_date: jsDate,
              },
            },
            create: {
              enrollment_id: r.enrollmentId,
              attendance_date: jsDate,
              status: normalizeAttendanceStatus(r.status),
              recorded_by: user.id,
              remarks: r.remark || null,
            },
            update: {
              status: normalizeAttendanceStatus(r.status),
              recorded_by: user.id,
              remarks: r.remark || null,
            },
          })
        );

      if (writes.length === 0) {
        return res.status(403).json({ message: 'No valid attendance records for this teacher' });
      }

      await prisma.$transaction(writes);

      return res.status(200).json({ message: 'Attendance saved' });
    } catch (err) {
      console.error('POST /api/teacher/attendance error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
