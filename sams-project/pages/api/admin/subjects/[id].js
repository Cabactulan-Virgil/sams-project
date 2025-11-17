import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.query;
  const subjectId = parseInt(id, 10);

  if (!subjectId || Number.isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject id' });
  }

  if (req.method === 'PUT') {
    try {
      const { code, name, description } = req.body || {};

      const data = {};
      if (code !== undefined) data.code = code;
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;

      const updated = await prisma.subject.update({
        where: { id: subjectId },
        data,
      });

      return res.status(200).json({
        success: true,
        subject: updated,
      });
    } catch (error) {
      console.error('Admin update subject error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update subject',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.subject.delete({ where: { id: subjectId } });
      return res.status(204).end();
    } catch (error) {
      console.error('Admin delete subject error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete subject',
      });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
