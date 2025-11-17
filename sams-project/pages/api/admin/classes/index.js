import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can manage classes',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { name, description } = req.body || {};

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required',
      });
    }

    const created = await prisma.classSection.create({
      data: {
        name,
        description: description || null,
      },
    });

    return res.status(201).json({
      success: true,
      classSection: {
        id: created.id,
        name: created.name,
        description: created.description,
      },
      message: 'Class created successfully',
    });
  } catch (error) {
    console.error('Admin create class error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
