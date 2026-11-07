import { describe, it, expect } from 'vitest';
import {
  generateWhatsAppMessage,
  buildWhatsAppLink,
  sanitizeWhatsAppNumber,
} from '../../server/utils/whatsapp.js';

describe('WhatsApp Booking Message & Link Formatting (Scenarios 14 & 15)', () => {
  it('Scenario 14: Sanitizes destination number properly (no spaces, dashes, or +)', () => {
    expect(sanitizeWhatsAppNumber('+62 812-3456-7890')).toBe('6281234567890');
    expect(sanitizeWhatsAppNumber('081234567890')).toBe('6281234567890');
    expect(sanitizeWhatsAppNumber('6281234567890')).toBe('6281234567890');
  });

  it('Scenario 15: Message contains all required booking details according to exact specification', () => {
    const msg = generateWhatsAppMessage({
      bookingReference: 'VIL-202611-ABCD12',
      customerName: 'Ahmad Fauzi',
      checkIn: '2026-12-10',
      checkOut: '2026-12-13',
      guestCount: 4,
      totalNights: 3,
      estimatedPrice: 10500000,
    });

    // Check required template headers and lines
    expect(msg).toContain('Halo Admin Villa, saya ingin melakukan pemesanan villa.');
    expect(msg).toContain('Booking Reference: VIL-202611-ABCD12');
    expect(msg).toContain('Nama: Ahmad Fauzi');
    expect(msg).toContain('Jumlah tamu: 4 orang');
    expect(msg).toContain('Durasi: 3 malam');
    expect(msg).toContain('Estimasi harga: Rp\u00a010.500.000' || '10.500.000');
    expect(msg).toContain('Mohon konfirmasi ketersediaan dan informasi pembayaran.');
    expect(msg).toContain('Terima kasih.');
  });

  it('Scenario 14 & 15: Builds valid wa.me URL with properly encoded message', () => {
    const link = buildWhatsAppLink({
      bookingReference: 'VIL-202611-998877',
      customerName: 'Budi Santoso',
      checkIn: '2026-12-24',
      checkOut: '2026-12-26',
      guestCount: 2,
      totalNights: 2,
      estimatedPrice: 7000000,
      whatsappNumber: '081234567890',
    });

    expect(link.startsWith('https://wa.me/6281234567890?text=')).toBe(true);
    expect(link).toContain('VIL-202611-998877');
    expect(link).toContain(encodeURIComponent('Budi Santoso'));
  });
});
