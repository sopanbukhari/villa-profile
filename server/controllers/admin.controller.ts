import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import prisma from '../db/prisma.js';
import { comparePassword } from '../utils/password.js';
import { signAdminToken } from '../utils/jwt.js';
import { BookingService } from '../services/booking.service.js';
import { VillaService } from '../services/villa.service.js';
import { AvailabilityService } from '../services/availability.service.js';
import {
  adminLoginSchema,
  updateVillaSchema,
  createFacilitySchema,
  createGalleryImageSchema,
  createPricingRuleSchema,
  updateSettingsSchema,
} from '../validators/admin.validator.js';
import { updateBookingStatusSchema, blockedDateSchema } from '../validators/booking.validator.js';

export class AdminController {
  /**
   * POST /api/admin/auth/login
   */
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);

      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!admin) {
        res.status(401).json({
          success: false,
          error: 'Email atau kata sandi tidak sesuai.',
        });
        return;
      }

      const isMatch = await comparePassword(password, admin.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Email atau kata sandi tidak sesuai.',
        });
        return;
      }

      const token = signAdminToken({
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      });

      res.json({
        success: true,
        message: 'Login berhasil.',
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, message: 'Logout berhasil.' });
  }

  /**
   * GET /api/admin/auth/me
   */
  static async me(req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: req.admin });
  }

  /**
   * GET /api/admin/dashboard
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await BookingService.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/bookings
   */
  static async getBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.listBookings({
        status: req.query.status as any,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/bookings/:id/status
   */
  static async updateBookingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, notes, holdHours } = updateBookingStatusSchema.parse(req.body);
      const adminId = req.admin!.id;

      const updated = await BookingService.updateStatus(id, status, adminId, {
        notes,
        holdHours,
      });

      res.json({
        success: true,
        message: `Status booking berhasil diperbarui ke ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/blocked-dates
   */
  static async listBlockedDates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let villaId = req.query.villaId as string;
      if (!villaId || villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        villaId = primary.id;
      }
      const list = await VillaService.listBlockedDates(villaId);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/blocked-dates
   */
  static async createBlockedDate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = blockedDateSchema.parse(req.body);
      if (body.villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        body.villaId = primary.id;
      }

      const blocked = await VillaService.addBlockedDate({
        ...body,
        adminId: req.admin!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Tanggal berhasil diblokir.',
        data: blocked,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/blocked-dates/:id
   */
  static async deleteBlockedDate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VillaService.deleteBlockedDate(id);
      res.json({ success: true, message: 'Blokir tanggal berhasil dihapus.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Villa CRUD
   */
  static async updateVilla(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      if (id === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        id = primary.id;
      }
      const data = updateVillaSchema.parse(req.body);
      const updated = await VillaService.updateVilla(id, data);
      res.json({ success: true, message: 'Profil villa berhasil diperbarui.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gallery CRUD
   */
  static async addGalleryImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = createGalleryImageSchema.parse(req.body);
      if (body.villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        body.villaId = primary.id;
      }
      const image = await VillaService.addGalleryImage(body);
      res.status(201).json({ success: true, message: 'Foto berhasil ditambahkan.', data: image });
    } catch (error) {
      next(error);
    }
  }

  static async updateGalleryImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await VillaService.updateGalleryImage(id, req.body);
      res.json({ success: true, message: 'Foto berhasil diperbarui.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGalleryImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VillaService.deleteGalleryImage(id);
      res.json({ success: true, message: 'Foto berhasil dihapus.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Facilities CRUD
   */
  static async addFacility(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = createFacilitySchema.parse(req.body);
      if (body.villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        body.villaId = primary.id;
      }
      const facility = await VillaService.addFacility(body);
      res.status(201).json({ success: true, message: 'Fasilitas berhasil ditambahkan.', data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async updateFacility(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await VillaService.updateFacility(id, req.body);
      res.json({ success: true, message: 'Fasilitas berhasil diperbarui.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFacility(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VillaService.deleteFacility(id);
      res.json({ success: true, message: 'Fasilitas berhasil dihapus.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pricing Rules CRUD
   */
  static async addPricingRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = createPricingRuleSchema.parse(req.body);
      if (body.villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        body.villaId = primary.id;
      }
      const rule = await VillaService.addPricingRule(body);
      res.status(201).json({ success: true, message: 'Aturan harga berhasil ditambahkan.', data: rule });
    } catch (error) {
      next(error);
    }
  }

  static async deletePricingRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VillaService.deletePricingRule(id);
      res.json({ success: true, message: 'Aturan harga berhasil dihapus.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await VillaService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = updateSettingsSchema.parse(req.body);
      const updated = await VillaService.updateSettings(body);
      res.json({ success: true, message: 'Pengaturan berhasil disimpan.', data: updated });
    } catch (error) {
      next(error);
    }
  }
}
