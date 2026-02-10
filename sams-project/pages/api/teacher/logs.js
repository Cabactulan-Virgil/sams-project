import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'teacher') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rows = await prisma.attendance.findMany({
      where: {
        recorded_by: user.id,
      },
      orderBy: [{ attendance_date: 'desc' }, { id: 'desc' }],
      take: 50,
      select: {
        id: true,
        enrollment_id: true,
        attendance_date: true,
        status: true,
        remarks: true,
        created_at: true,
        updated_at: true,
        enrollment: {
          select: {
            classes: { select: { id: true, name: true } },
            subjects: { select: { id: true, code: true, name: true } },
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
        },
      },
    });

    const logs = rows.map(r => ({
      id: r.id,
      enrollment_id: r.enrollment_id,
      attendance_date: toIso(r.attendance_date),
      status: r.status,
      remarks: r.remarks,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      class: r.enrollment?.classes || null,
      subject: r.enrollment?.subjects || null,
      student: r.enrollment?.users_enrollment_student_idTousers || null,
    }));

    return res.status(200).json({ logs });
  } catch (err) {
    console.error('GET /api/teacher/logs error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
