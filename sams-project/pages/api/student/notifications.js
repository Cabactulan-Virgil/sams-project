import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== 'student') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        studentId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error('GET /api/student/notifications error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
