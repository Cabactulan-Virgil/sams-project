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

  const { subjectId, from, to } = req.query;

  let fromDate = null;
  let toDate = null;

  if (from) {
    const d = new Date(from);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: 'Invalid from date' });
    }
    fromDate = d;
  }

  if (to) {
    const d = new Date(to);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: 'Invalid to date' });
    }
    toDate = d;
  }

  const where = {
    enrollment: {
      teacherId: user.id,
      ...(subjectId ? { subjectId: Number(subjectId) } : {}),
    },
    ...(fromDate || toDate
      ? {
          date: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : {}),
  };

  try {
    const records = await prisma.attendance.findMany({
      where,
      include: {
        enrollment: {
          include: {
            subject: true,
          },
        },
      },
    });

    const summaryBySubject = {};

    records.forEach(record => {
      const enrollment = record.enrollment;
      const subject = enrollment?.subject;
      if (!subject) return;

      const key = subject.id;
      if (!summaryBySubject[key]) {
        summaryBySubject[key] = {
          subjectId: subject.id,
          code: subject.code,
          name: subject.name,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          totalSessions: 0,
        };
      }

      const summary = summaryBySubject[key];
      summary.totalSessions += 1;

      if (record.status === 'PRESENT') summary.presentCount += 1;
      else if (record.status === 'LATE') summary.lateCount += 1;
      else if (record.status === 'ABSENT') summary.absentCount += 1;
    });

    const subjects = Object.values(summaryBySubject).map(s => {
      if (!s.totalSessions) {
        return { ...s, attendancePercentage: null };
      }

      const attended = s.presentCount + s.lateCount;
      const percentage = Math.round((attended * 100) / s.totalSessions);
      return { ...s, attendancePercentage: percentage };
    });

    return res.status(200).json({ subjects });
  } catch (err) {
    console.error('GET /api/teacher/reports error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
