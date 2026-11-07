import { formatIndonesianDate, formatIDR } from './date.js';

export interface WhatsAppMessageParams {
  bookingReference: string;
  customerName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guestCount: number;
  totalNights: number;
  estimatedPrice: number;
  whatsappNumber: string;
}

/**
 * Clean phone number to WhatsApp international standard (digits only, no + or spaces)
 * If starts with '08', convert to '628'
 */
export function sanitizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generate formatted WhatsApp booking inquiry message exactly as requested
 */
export function generateWhatsAppMessage(params: {
  bookingReference: string;
  customerName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guestCount: number;
  totalNights: number;
  estimatedPrice: number;
}): string {
  const formattedCheckIn = formatIndonesianDate(params.checkIn);
  const formattedCheckOut = formatIndonesianDate(params.checkOut);
  const formattedPrice = formatIDR(params.estimatedPrice);

  return (
    `Halo Admin Villa, saya ingin melakukan pemesanan villa.\n\n` +
    `Booking Reference: ${params.bookingReference}\n` +
    `Nama: ${params.customerName}\n` +
    `Check-in: ${formattedCheckIn}\n` +
    `Check-out: ${formattedCheckOut}\n` +
    `Jumlah tamu: ${params.guestCount} orang\n` +
    `Durasi: ${params.totalNights} malam\n` +
    `Estimasi harga: ${formattedPrice}\n\n` +
    `Mohon konfirmasi ketersediaan dan informasi pembayaran.\n\n` +
    `Terima kasih.`
  );
}

/**
 * Build wa.me redirect link
 */
export function buildWhatsAppLink(params: WhatsAppMessageParams): string {
  const cleanPhone = sanitizeWhatsAppNumber(params.whatsappNumber);
  const message = generateWhatsAppMessage({
    bookingReference: params.bookingReference,
    customerName: params.customerName,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guestCount: params.guestCount,
    totalNights: params.totalNights,
    estimatedPrice: params.estimatedPrice,
  });

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
