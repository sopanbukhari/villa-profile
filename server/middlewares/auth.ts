import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, AdminJwtPayload } from '../utils/jwt.js';
import prisma from '../db/prisma.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Akses ditolak. Token otentikasi tidak ditemukan.',
      });
      return;
    }

    const payload: AdminJwtPayload = verifyAdminToken(token);

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Sesi tidak valid atau akun admin tidak ditemukan.',
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Token otentikasi kedaluwarsa atau tidak valid.',
    });
  }
}
