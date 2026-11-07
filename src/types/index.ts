export type BookingStatus =
  | 'INQUIRY'
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED';

export interface VillaImage {
  id: string;
  villaId: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface VillaFacility {
  id: string;
  villaId: string;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  isFeatured: boolean;
}

export interface VillaPricingRule {
  id: string;
  villaId: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNightIdr: number;
  minStayNights: number;
}

export interface Villa {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  shortDescription?: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  mapUrl?: string;
  checkInTime: string;
  checkOutTime: string;
  basePriceIdr: number;
  weekendPriceIdr?: number | null;
  isActive: boolean;
  images: VillaImage[];
  facilities: VillaFacility[];
  pricing: VillaPricingRule[];
}

export interface PriceBreakdownItem {
  date: string;
  priceIdr: number;
  rateType: 'custom' | 'weekend' | 'base';
  ruleName?: string;
}

export interface AvailabilityCheckResponse {
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

export interface OccupiedDatesResponse {
  bookings: Array<{
    id: string;
    reference: string;
    status: BookingStatus;
    checkIn: string;
    checkOut: string;
  }>;
  blockedDates: Array<{
    id: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }>;
}

export interface BookingInquiryPayload {
  villaId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  specialRequests?: string;
}

export interface BookingInquiryResponse {
  booking: {
    id: string;
    bookingReference: string;
    villaName: string;
    customerName: string;
    checkIn: string;
    checkOut: string;
    totalNights: number;
    guestCount: number;
    totalAmountIdr: number;
    status: BookingStatus;
    createdAt: string;
  };
  whatsappNumber: string;
  whatsappLink: string;
  whatsappMessage: string;
}

export interface BookingDetail {
  id: string;
  bookingReference: string;
  villaName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  guestCount: number;
  baseRateIdr: number;
  totalAmountIdr: number;
  status: BookingStatus;
  expiresAt?: string;
  specialRequests?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  recentLogs?: Array<{
    id: string;
    previousStatus?: BookingStatus;
    newStatus: BookingStatus;
    changedBy?: { name: string };
    notes?: string;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
