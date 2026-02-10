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

  if (!user || user.role !== 'program_head') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { attendanceId, status, remarks } = req.body || {};
  const attendanceIdNum = Number(attendanceId);

  if (!attendanceIdNum || Number.isNaN(attendanceIdNum)) {
    return res.status(400).json({ message: 'attendanceId is required' });
  }

  const nextStatus = normalizeAttendanceStatus(status);
  if (!['present', 'late', 'absent'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const program = user.teacherProgram || null;

    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceIdNum },
      select: {
        id: true,
        status: true,
        enrollment: {
          select: {
            id: true,
            users_enrollment_student_idTousers: {
              select: {
                id: true,
                studentDepartment: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (program) {
      const studentDept = existing.enrollment?.users_enrollment_student_idTousers?.studentDepartment || null;
      if (studentDept !== program) {
        return res.status(403).json({ message: 'You cannot update attendance outside your program' });
      }
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceIdNum },
      data: {
        status: nextStatus,
        recorded_by: user.id,
        remarks: remarks != null ? String(remarks) : undefined,
        updated_at: new Date(),
      },
      select: { id: true, status: true },
    });

    return res.status(200).json({ attendance: updated });
  } catch (err) {
    console.error('POST /api/program-head/attendance error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
