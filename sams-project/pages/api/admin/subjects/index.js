import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  const authUser = getUserFromRequest(req);

  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can manage subjects',
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
    const { code, name, description } = req.body || {};

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Subject code and name are required',
      });
    }

    const created = await prisma.subject.create({
      data: {
        code,
        name,
        description: description || null,
      },
    });

    return res.status(201).json({
      success: true,
      subject: {
        id: created.id,
        code: created.code,
        name: created.name,
        description: created.description,
      },
      message: 'Subject created successfully',
    });
  } catch (error) {
    console.error('Admin create subject error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
