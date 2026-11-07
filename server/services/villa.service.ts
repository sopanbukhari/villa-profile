import prisma from '../db/prisma.js';
import { parseDateOnly, formatDateOnly } from '../utils/date.js';

export class VillaService {
  /**
   * Get default or primary villa with all images, facilities, and active pricing
   */
  static async getPrimaryVilla() {
    const villa = await prisma.villa.findFirst({
      where: { isActive: true },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        facilities: {
          orderBy: [{ isFeatured: 'desc' }, { category: 'asc' }, { name: 'asc' }],
        },
        pricing: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!villa) {
      throw new Error('Data villa belum tersedia.');
    }

    return {
      ...villa,
      basePriceIdr: Number(villa.basePriceIdr),
      weekendPriceIdr: villa.weekendPriceIdr ? Number(villa.weekendPriceIdr) : null,
      pricing: villa.pricing.map((p) => ({
        ...p,
        startDate: formatDateOnly(p.startDate),
        endDate: formatDateOnly(p.endDate),
        pricePerNightIdr: Number(p.pricePerNightIdr),
      })),
    };
  }

  /**
   * Get all villas (for multi-villa readiness)
   */
  static async getAllVillas() {
    const villas = await prisma.villa.findMany({
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return villas.map((v) => ({
      ...v,
      basePriceIdr: Number(v.basePriceIdr),
      weekendPriceIdr: v.weekendPriceIdr ? Number(v.weekendPriceIdr) : null,
    }));
  }

  /**
   * Get villa by ID or Slug
   */
  static async getVillaByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const villa = await prisma.villa.findUnique({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        facilities: {
          orderBy: [{ isFeatured: 'desc' }, { category: 'asc' }],
        },
        pricing: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!villa) {
      throw new Error('Villa tidak ditemukan.');
    }

    return {
      ...villa,
      basePriceIdr: Number(villa.basePriceIdr),
      weekendPriceIdr: villa.weekendPriceIdr ? Number(villa.weekendPriceIdr) : null,
      pricing: villa.pricing.map((p) => ({
        ...p,
        startDate: formatDateOnly(p.startDate),
        endDate: formatDateOnly(p.endDate),
        pricePerNightIdr: Number(p.pricePerNightIdr),
      })),
    };
  }

  /**
   * Admin: Update villa information
   */
  static async updateVilla(id: string, data: any) {
    return prisma.villa.update({
      where: { id },
      data,
    });
  }

  /**
   * Admin: Gallery Management
   */
  static async addGalleryImage(data: {
    villaId: string;
    url: string;
    caption?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }) {
    if (data.isPrimary) {
      await prisma.villaImage.updateMany({
        where: { villaId: data.villaId },
        data: { isPrimary: false },
      });
    }

    return prisma.villaImage.create({
      data: {
        villaId: data.villaId,
        url: data.url,
        caption: data.caption,
        isPrimary: !!data.isPrimary,
        displayOrder: data.displayOrder || 0,
      },
    });
  }

  static async updateGalleryImage(id: string, data: { caption?: string; isPrimary?: boolean; displayOrder?: number }) {
    if (data.isPrimary) {
      const current = await prisma.villaImage.findUnique({ where: { id } });
      if (current) {
        await prisma.villaImage.updateMany({
          where: { villaId: current.villaId },
          data: { isPrimary: false },
        });
      }
    }

    return prisma.villaImage.update({
      where: { id },
      data,
    });
  }

  static async deleteGalleryImage(id: string) {
    return prisma.villaImage.delete({ where: { id } });
  }

  /**
   * Admin: Facility Management
   */
  static async addFacility(data: {
    villaId: string;
    name: string;
    category: string;
    icon?: string;
    description?: string;
    isFeatured?: boolean;
  }) {
    return prisma.villaFacility.create({ data });
  }

  static async updateFacility(id: string, data: any) {
    return prisma.villaFacility.update({
      where: { id },
      data,
    });
  }

  static async deleteFacility(id: string) {
    return prisma.villaFacility.delete({ where: { id } });
  }

  /**
   * Admin: Pricing Rules Management
   */
  static async addPricingRule(data: {
    villaId: string;
    name: string;
    startDate: string;
    endDate: string;
    pricePerNightIdr: number;
    minStayNights?: number;
  }) {
    return prisma.villaPricing.create({
      data: {
        villaId: data.villaId,
        name: data.name,
        startDate: parseDateOnly(data.startDate),
        endDate: parseDateOnly(data.endDate),
        pricePerNightIdr: data.pricePerNightIdr,
        minStayNights: data.minStayNights || 1,
      },
    });
  }

  static async deletePricingRule(id: string) {
    return prisma.villaPricing.delete({ where: { id } });
  }

  /**
   * Admin: Blocked Dates Management
   */
  static async addBlockedDate(data: {
    villaId: string;
    startDate: string;
    endDate: string;
    reason?: string;
    adminId?: string;
  }) {
    return prisma.blockedDate.create({
      data: {
        villaId: data.villaId,
        startDate: parseDateOnly(data.startDate),
        endDate: parseDateOnly(data.endDate),
        reason: data.reason,
        createdById: data.adminId,
      },
    });
  }

  static async deleteBlockedDate(id: string) {
    return prisma.blockedDate.delete({ where: { id } });
  }

  static async listBlockedDates(villaId: string) {
    const list = await prisma.blockedDate.findMany({
      where: { villaId },
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return list.map((b) => ({
      id: b.id,
      startDate: formatDateOnly(b.startDate),
      endDate: formatDateOnly(b.endDate),
      reason: b.reason,
      createdBy: b.createdBy?.name || 'Admin',
      createdAt: b.createdAt,
    }));
  }

  /**
   * Admin: Settings Management
   */
  static async getSettings() {
    const list = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of list) {
      map[s.key] = s.value;
    }
    return map;
  }

  static async updateSettings(settingsMap: Record<string, string>) {
    const promises = Object.entries(settingsMap).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    await Promise.all(promises);
    return this.getSettings();
  }
}
