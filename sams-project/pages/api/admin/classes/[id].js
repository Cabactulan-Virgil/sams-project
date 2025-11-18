import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.query;
  const classId = parseInt(id, 10);

  if (!classId || Number.isNaN(classId)) {
    return res.status(400).json({ success: false, message: 'Invalid class id' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, description } = req.body || {};

      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;

      const updated = await prisma.classSection.update({
        where: { id: classId },
        data,
      });

      return res.status(200).json({
        success: true,
        classSection: updated,
      });
    } catch (error) {
      console.error('Admin update class error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update class',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.$transaction(async tx => {
        const enrollments = await tx.enrollment.findMany({
          where: { classId },
          select: { id: true },
        });

        const enrollmentIds = enrollments.map(e => e.id);

        if (enrollmentIds.length > 0) {
          await tx.attendance.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
          await tx.enrollment.deleteMany({ where: { id: { in: enrollmentIds } } });
        }

        await tx.classSection.delete({ where: { id: classId } });
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Admin delete class error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete class',
      });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
