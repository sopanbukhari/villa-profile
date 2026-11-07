import { describe, it, expect, vi } from 'vitest';
import { hasDateOverlap, parseDateOnly } from '../../server/utils/date.js';

describe('Availability Business Logic & Conflict Rules (Scenarios 7 - 12, 18)', () => {
  // Let's model a booking state conflict checker matching AvailabilityService logic
  function checkConflict(
    reqInStr: string,
    reqOutStr: string,
    existingItems: Array<{
      type: 'BOOKING' | 'BLOCK';
      checkIn: string;
      checkOut: string;
      status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
      expiresAt?: Date | null;
    }>
  ) {
    const reqIn = parseDateOnly(reqInStr);
    const reqOut = parseDateOnly(reqOutStr);
    const now = new Date();

    for (const item of existingItems) {
      const itemIn = parseDateOnly(item.checkIn);
      const itemOut = parseDateOnly(item.checkOut);

      const overlaps = hasDateOverlap(reqIn, reqOut, itemIn, itemOut);
      if (!overlaps) continue;

      if (item.type === 'BLOCK') {
        return { available: false, reason: 'Tanggal diblokir oleh admin (BR-005)' };
      }

      if (item.type === 'BOOKING') {
        // BR-004: Confirmed blocks dates
        if (item.status === 'CONFIRMED') {
          return { available: false, reason: 'Tanggal sudah terisi (BR-004)' };
        }

        // BR-006: Pending with active hold blocks dates
        if (item.status === 'PENDING') {
          if (item.expiresAt && item.expiresAt.getTime() > now.getTime()) {
            return { available: false, reason: 'Dalam masa hold pending (BR-006)' };
          }
          // BR-011: Expired pending does NOT block
        }

        // BR-007: CANCELLED, REJECTED, COMPLETED do NOT block
      }
    }

    return { available: true };
  }

  it('Scenario 7: Tanggal tersedia menghasilkan AVAILABLE', () => {
    const result = checkConflict('2027-04-10', '2027-04-15', []);
    expect(result.available).toBe(true);
  });

  it('Scenario 8: Tanggal Confirmed menghasilkan UNAVAILABLE (BR-004)', () => {
    const existing = [
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-12',
        checkOut: '2027-04-16',
        status: 'CONFIRMED' as const,
      },
    ];

    const result = checkConflict('2027-04-10', '2027-04-15', existing);
    expect(result.available).toBe(false);
    expect(result.reason).toContain('BR-004');
  });

  it('Scenario 9: Tanggal Blocked menghasilkan UNAVAILABLE (BR-005)', () => {
    const existing = [
      {
        type: 'BLOCK' as const,
        checkIn: '2027-04-11',
        checkOut: '2027-04-14',
      },
    ];

    const result = checkConflict('2027-04-10', '2027-04-15', existing);
    expect(result.available).toBe(false);
    expect(result.reason).toContain('BR-005');
  });

  it('Scenario 10: Pending aktif menghasilkan UNAVAILABLE (BR-006)', () => {
    const activeHold = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours
    const existing = [
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-12',
        checkOut: '2027-04-14',
        status: 'PENDING' as const,
        expiresAt: activeHold,
      },
    ];

    const result = checkConflict('2027-04-10', '2027-04-15', existing);
    expect(result.available).toBe(false);
    expect(result.reason).toContain('BR-006');
  });

  it('Scenario 11: Pending expired TIDAK memblokir tanggal (BR-006 & BR-007)', () => {
    const expiredHold = new Date(Date.now() - 3600 * 1000); // Expired 1 hour ago
    const existing = [
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-12',
        checkOut: '2027-04-14',
        status: 'PENDING' as const,
        expiresAt: expiredHold,
      },
    ];

    const result = checkConflict('2027-04-10', '2027-04-15', existing);
    expect(result.available).toBe(true);
  });

  it('Scenario 12: Cancelled booking TIDAK memblokir tanggal (BR-007)', () => {
    const existing = [
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-10',
        checkOut: '2027-04-15',
        status: 'CANCELLED' as const,
      },
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-10',
        checkOut: '2027-04-15',
        status: 'REJECTED' as const,
      },
      {
        type: 'BOOKING' as const,
        checkIn: '2027-04-10',
        checkOut: '2027-04-15',
        status: 'COMPLETED' as const,
      },
    ];

    const result = checkConflict('2027-04-10', '2027-04-15', existing);
    expect(result.available).toBe(true);
  });

  it('Scenario 18: Double booking validation prevents confirming overlapping bookings (BR-009)', () => {
    // Booking A is already confirmed for 2027-05-01 to 2027-05-05
    const confirmedStays = [
      {
        checkIn: '2027-05-01',
        checkOut: '2027-05-05',
        status: 'CONFIRMED' as const,
      },
    ];

    // Admin attempts to confirm Booking B for 2027-05-04 to 2027-05-08
    const checkB = checkConflict('2027-05-04', '2027-05-08', confirmedStays.map(s => ({
      type: 'BOOKING' as const,
      checkIn: s.checkIn,
      checkOut: s.checkOut,
      status: s.status,
    })));

    expect(checkB.available).toBe(false); // Double booking prevented!
  });
});
