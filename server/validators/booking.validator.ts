import { z } from 'zod';

export const checkAvailabilitySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in harus YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out harus YYYY-MM-DD'),
  guests: z.coerce.number().min(1, 'Jumlah tamu minimal 1 orang').default(1),
});

export const createInquirySchema = z.object({
  villaId: z.string().min(1, 'Villa ID wajib diisi'),
  customerName: z.string().min(2, 'Nama pemesan minimal 2 karakter').max(100),
  customerEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  customerPhone: z.string().min(8, 'Nomor WhatsApp / telepon minimal 8 digit').max(25),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in harus YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out harus YYYY-MM-DD'),
  guestCount: z.coerce.number().min(1, 'Jumlah tamu minimal 1 orang').default(2),
  specialRequests: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'INQUIRY',
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED',
    'EXPIRED',
  ]),
  notes: z.string().max(500).optional(),
  holdHours: z.coerce.number().min(1).max(168).optional().default(24), // default 24 hours hold for PENDING
});

export const blockedDateSchema = z.object({
  villaId: z.string().min(1, 'Villa ID wajib diisi'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal mulai harus YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal selesai harus YYYY-MM-DD'),
  reason: z.string().max(255).optional(),
});
