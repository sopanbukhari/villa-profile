import prisma from '../db/prisma.js';
import {
  validateBookingDates,
  parseDateOnly,
  formatDateOnly,
  hasDateOverlap,
  getNowInJakarta,
} from '../utils/date.js';

export interface PriceBreakdownItem {
  date: string;
  priceIdr: number;
  rateType: 'custom' | 'weekend' | 'base';
  ruleName?: string;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  maxGuests: number;
  totalEstimatedPrice: number;
  averageNightlyRate: number;
  breakdown: PriceBreakdownItem[];
  conflict?: {
    type: 'CONFIRMED_BOOKING' | 'PENDING_HOLD' | 'BLOCKED_BY_ADMIN';
    reference?: string;
    reason?: string;
  };
}

export class AvailabilityService {
  /**
   * Check if requested dates are available for a villa and calculate dynamic pricing
   */
  static async checkAvailability(
    villaId: string,
    checkInStr: string,
    checkOutStr: string,
    guestCount: number = 2
  ): Promise<AvailabilityResult> {
    // 1. Validate dates according to BR-001, BR-002, BR-003
    const validation = validateBookingDates(checkInStr, checkOutStr);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { checkInDate, checkOutDate, nights } = validation;

    // 2. Fetch villa
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      include: {
        pricing: true,
      },
    });

    if (!villa) {
      throw new Error('Villa tidak ditemukan.');
    }

    if (guestCount > villa.maxGuests) {
      return {
        available: false,
        reason: `Jumlah tamu (${guestCount}) melebihi kapasitas maksimum villa (${villa.maxGuests} tamu).`,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        nights,
        guestCount,
        maxGuests: villa.maxGuests,
        totalEstimatedPrice: 0,
        averageNightlyRate: 0,
        breakdown: [],
      };
    }

    // 3. Query overlapping bookings
    // Statuses that block dates:
    // - CONFIRMED (BR-004)
    // - PENDING if expiresAt > NOW() (BR-006)
    // Overlap condition: checkIn < reqOut AND checkOut > reqIn (BR-008 & overlap logic)
    const now = new Date();

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        villaId,
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
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
      select: {
        id: true,
        bookingReference: true,
        status: true,
        checkIn: true,
        checkOut: true,
        expiresAt: true,
      },
    });

    if (overlappingBookings.length > 0) {
      const conflictBooking = overlappingBookings[0];
      const conflictType =
        conflictBooking.status === 'CONFIRMED' ? 'CONFIRMED_BOOKING' : 'PENDING_HOLD';

      return {
        available: false,
        reason:
          conflictBooking.status === 'CONFIRMED'
            ? 'Tanggal yang Anda pilih sudah terisi (Confirmed).'
            : 'Tanggal yang Anda pilih sedang dalam masa hold pemesanan lain.',
        checkIn: checkInStr,
        checkOut: checkOutStr,
        nights,
        guestCount,
        maxGuests: villa.maxGuests,
        totalEstimatedPrice: 0,
        averageNightlyRate: 0,
        breakdown: [],
        conflict: {
          type: conflictType,
          reference: conflictBooking.bookingReference,
        },
      };
    }

    // 4. Query overlapping blocked dates (BR-005)
    const overlappingBlockedDates = await prisma.blockedDate.findMany({
      where: {
        villaId,
        startDate: { lt: checkOutDate },
        endDate: { gt: checkInDate },
      },
    });

    if (overlappingBlockedDates.length > 0) {
      const block = overlappingBlockedDates[0];
      return {
        available: false,
        reason: block.reason || 'Tanggal yang Anda pilih sedang ditutup oleh pihak villa.',
        checkIn: checkInStr,
        checkOut: checkOutStr,
        nights,
        guestCount,
        maxGuests: villa.maxGuests,
        totalEstimatedPrice: 0,
        averageNightlyRate: 0,
        breakdown: [],
        conflict: {
          type: 'BLOCKED_BY_ADMIN',
          reason: block.reason || 'Penyelenggaraan maintenance / reservasi khusus.',
        },
      };
    }

    // 5. Calculate Nightly Dynamic Pricing
    const breakdown: PriceBreakdownItem[] = [];
    let totalPrice = 0;

    const basePrice = Number(villa.basePriceIdr);
    const weekendPrice = villa.weekendPriceIdr ? Number(villa.weekendPriceIdr) : basePrice;

    // Iterate through each night from checkIn up to checkOut - 1 day
    for (let i = 0; i < nights; i++) {
      const currentNightDate = new Date(checkInDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = formatDateOnly(currentNightDate);

      // Check custom pricing rules
      const customRule = villa.pricing.find((rule) => {
        const start = rule.startDate.getTime();
        const end = rule.endDate.getTime();
        const curr = currentNightDate.getTime();
        return curr >= start && curr <= end;
      });

      let nightPrice = basePrice;
      let rateType: 'custom' | 'weekend' | 'base' = 'base';
      let ruleName: string | undefined = undefined;

      if (customRule) {
        nightPrice = Number(customRule.pricePerNightIdr);
        rateType = 'custom';
        ruleName = customRule.name;
      } else {
        // Check day of week (Friday = 5, Saturday = 6)
        const dayOfWeek = currentNightDate.getUTCDay();
        if ((dayOfWeek === 5 || dayOfWeek === 6) && villa.weekendPriceIdr) {
          nightPrice = weekendPrice;
          rateType = 'weekend';
          ruleName = 'Tarif Akhir Pekan (Jumat-Sabtu)';
        }
      }

      breakdown.push({
        date: dateKey,
        priceIdr: nightPrice,
        rateType,
        ruleName,
      });

      totalPrice += nightPrice;
    }

    return {
      available: true,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      nights,
      guestCount,
      maxGuests: villa.maxGuests,
      totalEstimatedPrice: totalPrice,
      averageNightlyRate: Math.round(totalPrice / nights),
      breakdown,
    };
  }

  /**
   * Get booked & blocked date ranges for calendar UI display
   */
  static async getOccupiedDates(villaId: string, fromDateStr?: string, toDateStr?: string) {
    const now = new Date();

    const fromDate = fromDateStr ? parseDateOnly(fromDateStr) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = toDateStr
      ? parseDateOnly(toDateStr)
      : new Date(now.getFullYear(), now.getMonth() + 6, 0);

    // Confirmed bookings & active pending holds
    const bookings = await prisma.booking.findMany({
      where: {
        villaId,
        checkIn: { lte: toDate },
        checkOut: { gte: fromDate },
        OR: [
          { status: 'CONFIRMED' },
          {
            status: 'PENDING',
            expiresAt: { gt: now },
          },
        ],
      },
      select: {
        id: true,
        bookingReference: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
    });

    // Blocked dates
    const blocked = await prisma.blockedDate.findMany({
      where: {
        villaId,
        startDate: { lte: toDate },
        endDate: { gte: fromDate },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    return {
      bookings: bookings.map((b) => ({
        id: b.id,
        reference: b.bookingReference,
        status: b.status,
        checkIn: formatDateOnly(b.checkIn),
        checkOut: formatDateOnly(b.checkOut),
      })),
      blockedDates: blocked.map((d) => ({
        id: d.id,
        startDate: formatDateOnly(d.startDate),
        endDate: formatDateOnly(d.endDate),
        reason: d.reason,
      })),
    };
  }
}
