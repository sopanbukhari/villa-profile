import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const updateVillaSchema = z.object({
  name: z.string().min(2, 'Nama villa minimal 2 karakter').optional(),
  slug: z.string().min(2).optional(),
  tagline: z.string().optional(),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').optional(),
  shortDescription: z.string().optional(),
  bedrooms: z.coerce.number().min(1).optional(),
  bathrooms: z.coerce.number().min(1).optional(),
  maxGuests: z.coerce.number().min(1).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  postalCode: z.string().optional(),
  mapUrl: z.string().url('Format URL Google Maps tidak valid').optional().or(z.literal('')),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam check-in HH:MM').optional(),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam check-out HH:MM').optional(),
  basePriceIdr: z.coerce.number().positive('Harga sewa harus lebih dari 0').optional(),
  weekendPriceIdr: z.coerce.number().positive().optional().nullable(),
});

export const createFacilitySchema = z.object({
  villaId: z.string().min(1),
  name: z.string().min(2),
  category: z.string().min(2),
  icon: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
});

export const createGalleryImageSchema = z.object({
  villaId: z.string().min(1),
  url: z.string().url('URL gambar tidak valid'),
  caption: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.coerce.number().optional().default(0),
});

export const createPricingRuleSchema = z.object({
  villaId: z.string().min(1),
  name: z.string().min(2),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pricePerNightIdr: z.coerce.number().positive('Harga sewa harus positif'),
  minStayNights: z.coerce.number().min(1).default(1),
});

export const updateSettingsSchema = z.record(z.string());

export const createAdminBookingSchema = z.object({
  villaId: z.string().optional().default('primary'),
  customerName: z.string().min(2, 'Nama pemesan minimal 2 karakter').max(100),
  customerPhone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(25),
  customerEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in harus YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out harus YYYY-MM-DD'),
  guestCount: z.coerce.number().min(1, 'Jumlah tamu minimal 1 orang').default(2),
  totalAmountIdr: z.coerce.number().optional(),
  status: z.enum(['INQUIRY', 'PENDING', 'CONFIRMED']).default('CONFIRMED'),
  holdHours: z.coerce.number().min(1).max(168).optional().default(24),
  adminNotes: z.string().max(500).optional(),
  specialRequests: z.string().max(500).optional(),
});
