import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'teacher') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        teacherId: user.id,
        ...(q
          ? {
              student: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { email: { contains: q, mode: 'insensitive' } },
                ],
              },
            }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendanceRecords: {
          select: {
            status: true,
          },
        },
      },
    });

    const summaryByStudent = {};

    enrollments.forEach(enrollment => {
      const s = enrollment.student;
      if (!s) return;

      if (!summaryByStudent[s.id]) {
        summaryByStudent[s.id] = {
          studentId: s.id,
          name: s.name,
          email: s.email,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          totalSessions: 0,
        };
      }

      const summary = summaryByStudent[s.id];

      enrollment.attendanceRecords.forEach(record => {
        summary.totalSessions += 1;
        if (record.status === 'PRESENT') summary.presentCount += 1;
        else if (record.status === 'LATE') summary.lateCount += 1;
        else if (record.status === 'ABSENT') summary.absentCount += 1;
      });
    });

    const students = Object.values(summaryByStudent).map(s => {
      if (!s.totalSessions) {
        return { ...s, attendancePercentage: null };
      }

      const attended = s.presentCount + s.lateCount;
      const percentage = Math.round((attended * 100) / s.totalSessions);
      return { ...s, attendancePercentage: percentage };
    });

    return res.status(200).json({ students });
  } catch (err) {
    console.error('GET /api/teacher/students error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
