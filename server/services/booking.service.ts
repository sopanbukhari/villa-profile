import crypto from 'crypto';
import prisma from '../db/prisma.js';
import { AvailabilityService } from './availability.service.js';
import { buildWhatsAppLink, generateWhatsAppMessage } from '../utils/whatsapp.js';
import { parseDateOnly, formatDateOnly } from '../utils/date.js';
import { BookingStatus } from '@prisma/client';

export class BookingService {
  /**
   * Generate a unique reference number: VIL-YYYYMM-XXXX
   */
  static generateReference(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `VIL-${yearMonth}-${randomHex}`;
  }

  /**
   * Get WhatsApp number configured in DB settings or fall back to env
   */
  static async getTargetWhatsAppNumber(): Promise<string> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'WHATSAPP_NUMBER' },
      });
      if (setting && setting.value.trim().length > 0) {
        return setting.value.trim();
      }
    } catch {
      // Ignore error during initial boot
    }
    return process.env.WHATSAPP_NUMBER || '6281234567890';
  }

  /**
   * Create customer booking inquiry
   */
  static async createInquiry(data: {
    villaId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    specialRequests?: string;
  }) {
    // 1. Check availability and price calculation
    const availability = await AvailabilityService.checkAvailability(
      data.villaId,
      data.checkIn,
      data.checkOut,
      data.guestCount
    );

    if (!availability.available) {
      throw new Error(availability.reason || 'Tanggal yang dipilih tidak tersedia.');
    }

    // 2. Generate unique reference with collision check
    let bookingReference = this.generateReference();
    let exists = await prisma.booking.findUnique({ where: { bookingReference } });
    while (exists) {
      bookingReference = this.generateReference();
      exists = await prisma.booking.findUnique({ where: { bookingReference } });
    }

    const checkInDate = parseDateOnly(data.checkIn);
    const checkOutDate = parseDateOnly(data.checkOut);

    // 3. Create INQUIRY record in DB
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        villaId: data.villaId,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalNights: availability.nights,
        guestCount: data.guestCount,
        baseRateIdr: availability.averageNightlyRate,
        totalAmountIdr: availability.totalEstimatedPrice,
        status: 'INQUIRY',
        specialRequests: data.specialRequests || null,
      },
      include: {
        villa: {
          select: {
            name: true,
          },
        },
      },
    });

    // 4. Log initial status
    await prisma.bookingStatusLog.create({
      data: {
        bookingId: booking.id,
        previousStatus: null,
        newStatus: 'INQUIRY',
        notes: 'Inquiry dibuat oleh customer melalui website.',
      },
    });

    // 5. Generate WhatsApp redirect message & link
    const whatsappNumber = await this.getTargetWhatsAppNumber();
    const whatsappLink = buildWhatsAppLink({
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      totalNights: booking.totalNights,
      estimatedPrice: Number(booking.totalAmountIdr),
      whatsappNumber,
    });

    const whatsappMessage = generateWhatsAppMessage({
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      totalNights: booking.totalNights,
      estimatedPrice: Number(booking.totalAmountIdr),
    });

    return {
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        villaName: booking.villa.name,
        customerName: booking.customerName,
        checkIn: formatDateOnly(booking.checkIn),
        checkOut: formatDateOnly(booking.checkOut),
        totalNights: booking.totalNights,
        guestCount: booking.guestCount,
        totalAmountIdr: Number(booking.totalAmountIdr),
        status: booking.status,
        createdAt: booking.createdAt,
      },
      whatsappNumber,
      whatsappLink,
      whatsappMessage,
    };
  }

  /**
   * Get booking details by reference (Public API)
   */
  static async getByReference(reference: string) {
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        villa: {
          select: {
            name: true,
            address: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking dengan referensi ini tidak ditemukan.');
    }

    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      villaName: booking.villa.name,
      villaAddress: booking.villa.address,
      customerName: booking.customerName,
      checkIn: formatDateOnly(booking.checkIn),
      checkOut: formatDateOnly(booking.checkOut),
      checkInTime: booking.villa.checkInTime,
      checkOutTime: booking.villa.checkOutTime,
      totalNights: booking.totalNights,
      guestCount: booking.guestCount,
      totalAmountIdr: Number(booking.totalAmountIdr),
      status: booking.status,
      expiresAt: booking.expiresAt,
      createdAt: booking.createdAt,
    };
  }

  /**
   * Admin: List all bookings with filtering, search, pagination
   */
  static async listBookings(params: {
    status?: BookingStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { bookingReference: { contains: params.search, mode: 'insensitive' } },
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { customerPhone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.startDate) {
      where.checkIn = { gte: parseDateOnly(params.startDate) };
    }

    if (params.endDate) {
      where.checkOut = { lte: parseDateOnly(params.endDate) };
    }

    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          villa: { select: { name: true } },
          statusLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { changedBy: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items.map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        villaName: b.villa.name,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        checkIn: formatDateOnly(b.checkIn),
        checkOut: formatDateOnly(b.checkOut),
        totalNights: b.totalNights,
        guestCount: b.guestCount,
        baseRateIdr: Number(b.baseRateIdr),
        totalAmountIdr: Number(b.totalAmountIdr),
        status: b.status,
        expiresAt: b.expiresAt,
        specialRequests: b.specialRequests,
        adminNotes: b.adminNotes,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        recentLogs: b.statusLogs,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Update booking status with atomic transaction & overlap protection
   * BR-009, BR-011, BR-012
   */
  static async updateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    adminId: string,
    options?: {
      notes?: string;
      holdHours?: number;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking tidak ditemukan.');
      }

      const previousStatus = booking.status;

      // If transitioning to CONFIRMED or PENDING, perform atomic overlap check
      if (newStatus === 'CONFIRMED' || newStatus === 'PENDING') {
        const now = new Date();

        // Check overlapping bookings
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            id: { not: bookingId },
            villaId: booking.villaId,
            AND: [
              { checkIn: { lt: booking.checkOut } },
              { checkOut: { gt: booking.checkIn } },
              {
                OR: [
                  { status: 'CONFIRMED' },
                  {
                    status: 'PENDING',
                    expiresAt: { gt: now },
                  },
                ],
              },
            ],
          },
        });

        if (conflictingBooking) {
          throw new Error(
            `Double booking dicegah (BR-009): Tanggal bentrok dengan booking ${conflictingBooking.bookingReference} (Status: ${conflictingBooking.status}).`
          );
        }

        // Check overlapping admin blocked dates
        const conflictingBlock = await tx.blockedDate.findFirst({
          where: {
            villaId: booking.villaId,
            startDate: { lt: booking.checkOut },
            endDate: { gt: booking.checkIn },
          },
        });

        if (conflictingBlock) {
          throw new Error(
            `Tidak dapat mengonfirmasi booking: Tanggal diblokir oleh admin (${conflictingBlock.reason || 'Blocked'}).`
          );
        }
      }

      // Calculate expiresAt if status is PENDING
      let expiresAt: Date | null = booking.expiresAt;
      if (newStatus === 'PENDING') {
        const holdHours = options?.holdHours || 24;
        expiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);
      } else if (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
        expiresAt = null;
      }

      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          expiresAt,
          adminNotes: options?.notes ? options.notes : booking.adminNotes,
        },
      });

      // Insert audit log (BR-011)
      await tx.bookingStatusLog.create({
        data: {
          bookingId: booking.id,
          previousStatus,
          newStatus,
          changedById: adminId,
          notes: options?.notes || `Status diubah dari ${previousStatus} ke ${newStatus}`,
        },
      });

      return updatedBooking;
    });
  }

  /**
   * Admin: Get dashboard summary metrics
   */
  static async getDashboardMetrics() {
    const now = new Date();
    const today = parseDateOnly(formatDateOnly(now));

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      upcomingBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: 'PENDING',
          expiresAt: { gt: now },
        },
      }),
      prisma.booking.count({
        where: { status: 'CONFIRMED' },
      }),
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          checkIn: { gte: today },
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          villa: { select: { name: true } },
        },
      }),
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      upcomingBookings,
      recentBookings: recentBookings.map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        customerName: b.customerName,
        villaName: b.villa.name,
        checkIn: formatDateOnly(b.checkIn),
        checkOut: formatDateOnly(b.checkOut),
        totalNights: b.totalNights,
        totalAmountIdr: Number(b.totalAmountIdr),
        status: b.status,
        createdAt: b.createdAt,
      })),
    };
  }
}
