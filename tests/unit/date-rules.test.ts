import { describe, it, expect } from 'vitest';
import {
  validateBookingDates,
  calculateNights,
  hasDateOverlap,
  parseDateOnly,
  formatDateOnly,
  getNowInJakarta,
} from '../../server/utils/date.js';

describe('Business Rules: Date Validation & Overlap (BR-001, BR-002, BR-003, BR-008)', () => {
  it('Scenario 4: Validates normal future check-in and check-out selection', () => {
    const now = getNowInJakarta();
    const futureCheckIn = new Date(Date.UTC(now.getFullYear() + 1, 5, 10));
    const futureCheckOut = new Date(Date.UTC(now.getFullYear() + 1, 5, 14));

    const inStr = formatDateOnly(futureCheckIn);
    const outStr = formatDateOnly(futureCheckOut);

    const result = validateBookingDates(inStr, outStr);
    expect(result.isValid).toBe(true);
    expect(result.nights).toBe(4);
  });

  it('Scenario 5: Check-out before check-in is rejected (BR-002)', () => {
    const inStr = '2027-08-15';
    const outStr = '2027-08-10';

    const result = validateBookingDates(inStr, outStr);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('lebih besar');
  });

  it('Scenario 5b: Check-out on same day as check-in is rejected (minimum 1 night)', () => {
    const inStr = '2027-08-15';
    const outStr = '2027-08-15';

    const result = validateBookingDates(inStr, outStr);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('minimal 1 malam');
  });

  it('Scenario 6: Past dates are rejected (BR-003)', () => {
    const pastIn = '2020-01-01';
    const pastOut = '2020-01-05';

    const result = validateBookingDates(pastIn, pastOut);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('masa lampau');
  });

  it('Scenario BR-008: Check-out date can legally be the check-in date of next booking', () => {
    // Booking 1: 10th to 12th
    const b1In = parseDateOnly('2027-09-10');
    const b1Out = parseDateOnly('2027-09-12');

    // Booking 2 starts on the check-out date of Booking 1: 12th to 15th
    const b2In = parseDateOnly('2027-09-12');
    const b2Out = parseDateOnly('2027-09-15');

    // Overlap formula: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
    // 2027-09-10 < 2027-09-15 (TRUE), but 2027-09-12 > 2027-09-12 (FALSE!)
    const overlaps = hasDateOverlap(b2In, b2Out, b1In, b1Out);
    expect(overlaps).toBe(false); // No overlap!
  });

  it('Strict overlap detection works when ranges collide', () => {
    // Existing: 10th to 15th
    const existIn = parseDateOnly('2027-09-10');
    const existOut = parseDateOnly('2027-09-15');

    // Requested: 12th to 14th (fully inside)
    const reqIn = parseDateOnly('2027-09-12');
    const reqOut = parseDateOnly('2027-09-14');

    expect(hasDateOverlap(reqIn, reqOut, existIn, existOut)).toBe(true);

    // Requested: 8th to 11th (overlap at start)
    expect(hasDateOverlap(parseDateOnly('2027-09-08'), parseDateOnly('2027-09-11'), existIn, existOut)).toBe(true);

    // Requested: 14th to 18th (overlap at end)
    expect(hasDateOverlap(parseDateOnly('2027-09-14'), parseDateOnly('2027-09-18'), existIn, existOut)).toBe(true);

    // Requested: completely outside before: 5th to 10th
    expect(hasDateOverlap(parseDateOnly('2027-09-05'), parseDateOnly('2027-09-10'), existIn, existOut)).toBe(false);

    // Requested: completely outside after: 15th to 20th
    expect(hasDateOverlap(parseDateOnly('2027-09-15'), parseDateOnly('2027-09-20'), existIn, existOut)).toBe(false);
  });
});
