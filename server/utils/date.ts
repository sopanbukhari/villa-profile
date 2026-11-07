import { parseISO, format, differenceInCalendarDays, isBefore, startOfDay, addHours } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Jakarta';

/**
 * Get current date/time in Asia/Jakarta timezone
 */
export function getNowInJakarta(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Parse date string YYYY-MM-DD into a normalized Date object at midnight UTC
 */
export function parseDateOnly(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateOnly(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date in Indonesian localized human-readable string
 * e.g. "12 November 2026"
 */
export function formatIndonesianDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format currency in Indonesian Rupiah
 * e.g. "Rp 2.500.000"
 */
export function formatIDR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Calculate nights between check-in and check-out
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const inUtc = Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate());
  const outUtc = Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate());
  const diffMs = outUtc - inUtc;
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days;
}

/**
 * Checks if interval [reqIn, reqOut) overlaps with [existIn, existOut)
 * BR-008: check_out date can be the check_in date of the next guest.
 * Formula: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
 */
export function hasDateOverlap(
  reqIn: Date,
  reqOut: Date,
  existIn: Date,
  existOut: Date
): boolean {
  const reqInTime = reqIn.getTime();
  const reqOutTime = reqOut.getTime();
  const existInTime = existIn.getTime();
  const existOutTime = existOut.getTime();

  return existInTime < reqOutTime && existOutTime > reqInTime;
}

/**
 * Validate check-in and check-out dates against business rules:
 * BR-001: both must exist
 * BR-002: check_out > check_in
 * BR-003: check_in cannot be in the past (Jakarta time)
 */
export function validateBookingDates(checkInStr: string, checkOutStr: string): {
  isValid: boolean;
  error?: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
} {
  try {
    const checkInDate = parseDateOnly(checkInStr);
    const checkOutDate = parseDateOnly(checkOutStr);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return {
        isValid: false,
        error: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.',
        checkInDate,
        checkOutDate,
        nights: 0,
      };
    }

    // Check past dates based on today in Jakarta
    const nowJakarta = getNowInJakarta();
    const todayJakartaMidnight = new Date(Date.UTC(
      nowJakarta.getFullYear(),
      nowJakarta.getMonth(),
      nowJakarta.getDate(),
      0, 0, 0, 0
    ));

    if (checkInDate.getTime() < todayJakartaMidnight.getTime()) {
      return {
        isValid: false,
        error: 'Tanggal check-in tidak boleh di masa lampau.',
        checkInDate,
        checkOutDate,
        nights: 0,
      };
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    if (nights <= 0) {
      return {
        isValid: false,
        error: 'Tanggal check-out harus lebih besar dari tanggal check-in (minimal 1 malam).',
        checkInDate,
        checkOutDate,
        nights,
      };
    }

    return {
      isValid: true,
      checkInDate,
      checkOutDate,
      nights,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || 'Gagal memvalidasi tanggal.',
      checkInDate: new Date(),
      checkOutDate: new Date(),
      nights: 0,
    };
  }
}
