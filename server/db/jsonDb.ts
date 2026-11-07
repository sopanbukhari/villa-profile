import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface AdminRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface VillaRecord {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  shortDescription?: string | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  address: string;
  city: string;
  province: string;
  postalCode?: string | null;
  mapUrl?: string | null;
  checkInTime: string;
  checkOutTime: string;
  basePriceIdr: number;
  weekendPriceIdr?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VillaImageRecord {
  id: string;
  villaId: string;
  url: string;
  caption?: string | null;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface VillaFacilityRecord {
  id: string;
  villaId: string;
  name: string;
  category: string;
  icon?: string | null;
  description?: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export interface VillaPricingRecord {
  id: string;
  villaId: string;
  name: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;   // ISO date YYYY-MM-DD
  pricePerNightIdr: number;
  minStayNights: number;
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  villaId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  checkIn: string; // ISO date YYYY-MM-DD
  checkOut: string; // ISO date YYYY-MM-DD
  totalNights: number;
  guestCount: number;
  baseRateIdr: number;
  totalAmountIdr: number;
  status: 'INQUIRY' | 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
  expiresAt?: string | null; // ISO timestamp
  specialRequests?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedDateRecord {
  id: string;
  villaId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdById?: string | null;
  createdAt: string;
}

export interface BookingStatusLogRecord {
  id: string;
  bookingId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedById?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface SettingRecord {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

export interface DatabaseSchema {
  admins: AdminRecord[];
  villas: VillaRecord[];
  villa_images: VillaImageRecord[];
  villa_facilities: VillaFacilityRecord[];
  villa_pricing: VillaPricingRecord[];
  bookings: BookingRecord[];
  blocked_dates: BlockedDateRecord[];
  booking_status_logs: BookingStatusLogRecord[];
  settings: SettingRecord[];
}

// Initial seed data generator
function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();
  const defaultPasswordHash = bcrypt.hashSync(
    process.env.ADMIN_PASSWORD || 'SecureAdminPassword123!',
    10
  );

  const villaId = 'villa-paradise-1';

  return {
    admins: [
      {
        id: 'admin-1',
        email: (process.env.ADMIN_EMAIL || 'admin@villaparadise.com').toLowerCase().trim(),
        passwordHash: defaultPasswordHash,
        name: process.env.ADMIN_NAME || 'Admin Villa Paradise',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      },
    ],
    villas: [
      {
        id: villaId,
        name: 'Villa Paradise Sanctuary',
        slug: 'villa-paradise-sanctuary',
        tagline: 'An Exclusive Tropical Haven in Ubud, Bali',
        description:
          'Villa Paradise Sanctuary adalah mahakarya arsitektur tropis modern yang tersembunyi di lembah sungai Ayung, Sayan, Ubud. Dikelilingi hutan hujan asri dan gemericik air alami, villa ini menawarkan privasi tanpa batas, infinity pool pribadi yang menghadap lembah hijau, paviliun ruang tamu berkonsep terbuka, serta 3 kamar tidur mewah dengan kamar mandi marmer ensuite. Sangat ideal untuk liburan keluarga, perjalanan romantis, maupun retret privat bersama orang tercinta.',
        shortDescription:
          'Villa mewah 3 kamar tidur dengan kolam renang infinity pribadi di tepi lembah hutan tropis Ubud, Bali.',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        address: 'Jl. Raya Sayan No. 88, Sayan',
        city: 'Ubud, Gianyar',
        province: 'Bali',
        postalCode: '80571',
        mapUrl: 'https://maps.google.com/?q=Ubud+Bali',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        basePriceIdr: 3500000,
        weekendPriceIdr: 4200000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    villa_images: [
      {
        id: 'img-1',
        villaId,
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
        caption: 'Main Villa Exterior & Tropical Sun Deck',
        isPrimary: true,
        displayOrder: 1,
        createdAt: now,
      },
      {
        id: 'img-2',
        villaId,
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
        caption: 'Private Infinity Pool Overlooking Rainforest',
        isPrimary: false,
        displayOrder: 2,
        createdAt: now,
      },
      {
        id: 'img-3',
        villaId,
        url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
        caption: 'Open-Air Living Pavilion & Dining Area',
        isPrimary: false,
        displayOrder: 3,
        createdAt: now,
      },
      {
        id: 'img-4',
        villaId,
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
        caption: 'Master Suite with King Bed & Forest View',
        isPrimary: false,
        displayOrder: 4,
        createdAt: now,
      },
      {
        id: 'img-5',
        villaId,
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
        caption: 'En-suite Luxury Marble Bathroom with Terrazzo Tub',
        isPrimary: false,
        displayOrder: 5,
        createdAt: now,
      },
      {
        id: 'img-6',
        villaId,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        caption: 'Fully Equipped Gourmet Kitchen and Island Bar',
        isPrimary: false,
        displayOrder: 6,
        createdAt: now,
      },
    ],
    villa_facilities: [
      {
        id: 'fac-1',
        villaId,
        name: 'Private Infinity Pool',
        category: 'Living & Outdoor',
        icon: 'waves',
        description: 'Kolam renang air tawar pribadi dengan pemandangan lembah tropis spektakuler.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-2',
        villaId,
        name: 'High-Speed Wi-Fi 100 Mbps',
        category: 'Living & Outdoor',
        icon: 'wifi',
        description: 'Koneksi internet serat optik stabil dan cepat di seluruh area villa.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-3',
        villaId,
        name: 'Air Conditioning di Setiap Kamar',
        category: 'Bedroom & Bath',
        icon: 'wind',
        description: 'Unit AC inverter senyap di seluruh 3 kamar tidur.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-4',
        villaId,
        name: 'En-suite Marble Bathroom & Bathtub',
        category: 'Bedroom & Bath',
        icon: 'bath',
        description: 'Bak mandi terrazzo berendam mewah dengan view taman semi terbuka.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-5',
        villaId,
        name: 'Gourmet Kitchen & Espresso Bar',
        category: 'Kitchen & Dining',
        icon: 'coffee',
        description: 'Dapur lengkap dengan oven, kulkas 2 pintu, kompor induksi, dan mesin kopi kapsul.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-6',
        villaId,
        name: 'Smart TV 65" dengan Netflix',
        category: 'Entertainment',
        icon: 'tv',
        description: 'Smart TV UHD dengan soundbar cinematic di ruang tamu utama.',
        isFeatured: false,
        createdAt: now,
      },
      {
        id: 'fac-7',
        villaId,
        name: 'Daily Housekeeping & Turndown',
        category: 'Services',
        icon: 'sparkles',
        description: 'Layanan kebersihan harian profesional untuk kenyamanan maksimal.',
        isFeatured: true,
        createdAt: now,
      },
      {
        id: 'fac-8',
        villaId,
        name: 'Private Parking & 24/7 Security',
        category: 'Services',
        icon: 'shield-check',
        description: 'Area parkir mobil pribadi dengan gerbang otomatis dan pengawasan 24 jam.',
        isFeatured: false,
        createdAt: now,
      },
    ],
    villa_pricing: [
      {
        id: 'pricing-1',
        villaId,
        name: 'End of Year Peak Season',
        startDate: '2026-12-20',
        endDate: '2027-01-05',
        pricePerNightIdr: 5500000,
        minStayNights: 2,
        createdAt: now,
      },
    ],
    bookings: [],
    blocked_dates: [],
    booking_status_logs: [],
    settings: [
      {
        id: 'set-1',
        key: 'WHATSAPP_NUMBER',
        value: process.env.WHATSAPP_NUMBER || '6281234567890',
        description: 'Nomor WhatsApp admin untuk menerima inquiry booking customer',
        updatedAt: now,
      },
      {
        id: 'set-2',
        key: 'VILLA_NAME',
        value: 'Villa Paradise Sanctuary',
        description: 'Nama properti villa',
        updatedAt: now,
      },
      {
        id: 'set-3',
        key: 'CONTACT_PHONE',
        value: '+62 812-3456-7890',
        description: 'Nomor telepon kontak resmi',
        updatedAt: now,
      },
      {
        id: 'set-4',
        key: 'CONTACT_EMAIL',
        value: 'booking@villaparadisesanctuary.com',
        description: 'Email resmi reservasi',
        updatedAt: now,
      },
      {
        id: 'set-5',
        key: 'ADDRESS',
        value: 'Jl. Raya Sayan No. 88, Ubud, Bali, Indonesia 80571',
        description: 'Alamat lengkap properti',
        updatedAt: now,
      },
      {
        id: 'set-6',
        key: 'CHECK_IN_TIME',
        value: '14:00',
        description: 'Waktu standar check-in',
        updatedAt: now,
      },
      {
        id: 'set-7',
        key: 'CHECK_OUT_TIME',
        value: '12:00',
        description: 'Waktu standar check-out',
        updatedAt: now,
      },
      {
        id: 'set-8',
        key: 'HOLD_HOURS',
        value: '24',
        description: 'Batas durasi hold booking (dalam jam) untuk status PENDING',
        updatedAt: now,
      },
      {
        id: 'set-9',
        key: 'CANCELLATION_POLICY',
        value:
          'Pembatalan gratis hingga 7 hari sebelum jadwal check-in. Pembatalan dalam kurun waktu 7 hari dikenakan biaya 50% dari total nilai pemesanan.',
        description: 'Kebijakan pembatalan reservasi',
        updatedAt: now,
      },
      {
        id: 'set-10',
        key: 'BOOKING_POLICY',
        value:
          'Reservasi dianggap sah setelah pembayaran uang muka (DP) minimal 50% diterima dan dikonfirmasi oleh Admin Villa.',
        description: 'Ketentuan pemesanan',
        updatedAt: now,
      },
    ],
  };
}

class JsonDatabase {
  private filePath: string;
  private data: DatabaseSchema;

  constructor() {
    // Check possible write paths
    const localDataDir = path.resolve(process.cwd(), 'data');
    const localFilePath = path.join(localDataDir, 'db.json');

    // On Vercel serverless environment, filesystem is read-only except /tmp
    const isVercel = !!process.env.VERCEL;
    const tmpFilePath = path.join('/tmp', 'db.json');

    this.filePath = isVercel ? tmpFilePath : localFilePath;

    // Load or initialize
    this.data = this.loadData(localFilePath, tmpFilePath, isVercel);
  }

  private loadData(localFilePath: string, tmpFilePath: string, isVercel: boolean): DatabaseSchema {
    try {
      // If running on Vercel and /tmp/db.json exists, load it
      if (isVercel && fs.existsSync(tmpFilePath)) {
        const raw = fs.readFileSync(tmpFilePath, 'utf8');
        return JSON.parse(raw);
      }

      // Check local repo db.json
      if (fs.existsSync(localFilePath)) {
        const raw = fs.readFileSync(localFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db.json, generating default data:', e);
    }

    // Default initial data
    const initial = getInitialData();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      // In read-only serverless environment fallback, data persists in memory
      console.warn('[JsonDb] File write failed, preserving in memory:', err);
    }
  }

  public save(): void {
    this.saveDataDirect(this.data);
  }

  public reset(): void {
    this.data = getInitialData();
    this.save();
  }

  // --- MODEL IMPLEMENTATIONS ---

  public get admin() {
    return {
      findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email) {
          return this.data.admins.find((a) => a.email.toLowerCase() === where.email!.toLowerCase()) || null;
        }
        if (where.id) {
          return this.data.admins.find((a) => a.id === where.id) || null;
        }
        return null;
      },
      findMany: async () => this.data.admins,
      create: async ({ data }: { data: Omit<AdminRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
        const record: AdminRecord = {
          ...data,
          id: `admin-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.admins.push(record);
        this.save();
        return record;
      },
      upsert: async ({ where, update, create }: any) => {
        const existingIndex = this.data.admins.findIndex((a) => a.email === where.email);
        if (existingIndex >= 0) {
          this.data.admins[existingIndex] = {
            ...this.data.admins[existingIndex],
            ...update,
            updatedAt: new Date().toISOString(),
          };
          this.save();
          return this.data.admins[existingIndex];
        }
        return this.admin.create({ data: create });
      },
    };
  }

  public get villa() {
    return {
      findFirst: async ({ where, include }: any = {}) => {
        const v = this.data.villas.find((item) => (where?.isActive !== undefined ? item.isActive === where.isActive : true));
        if (!v) return null;
        return this.attachVillaRelations(v, include);
      },
      findUnique: async ({ where, include }: any) => {
        const v = this.data.villas.find((item) =>
          where.id ? item.id === where.id : where.slug ? item.slug === where.slug : false
        );
        if (!v) return null;
        return this.attachVillaRelations(v, include);
      },
      findMany: async ({ include }: any = {}) => {
        return this.data.villas.map((v) => this.attachVillaRelations(v, include));
      },
      update: async ({ where, data }: any) => {
        const index = this.data.villas.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error('Villa tidak ditemukan');
        this.data.villas[index] = {
          ...this.data.villas[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this.save();
        return this.data.villas[index];
      },
    };
  }

  private attachVillaRelations(villa: VillaRecord, include: any = {}) {
    const result: any = { ...villa };
    if (include?.images) {
      result.images = this.data.villa_images
        .filter((img) => img.villaId === villa.id)
        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.displayOrder - b.displayOrder);
    }
    if (include?.facilities) {
      result.facilities = this.data.villa_facilities
        .filter((f) => f.villaId === villa.id)
        .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name));
    }
    if (include?.pricing) {
      result.pricing = this.data.villa_pricing.filter((p) => p.villaId === villa.id);
    }
    return result;
  }

  public get villaImage() {
    return {
      findUnique: async ({ where }: any) => this.data.villa_images.find((img) => img.id === where.id) || null,
      findMany: async ({ where }: any = {}) => {
        return this.data.villa_images.filter((img) => (!where?.villaId ? true : img.villaId === where.villaId));
      },
      create: async ({ data }: any) => {
        const record: VillaImageRecord = {
          ...data,
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
        };
        this.data.villa_images.push(record);
        this.save();
        return record;
      },
      update: async ({ where, data }: any) => {
        const index = this.data.villa_images.findIndex((img) => img.id === where.id);
        if (index === -1) throw new Error('Foto tidak ditemukan');
        this.data.villa_images[index] = { ...this.data.villa_images[index], ...data };
        this.save();
        return this.data.villa_images[index];
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        this.data.villa_images.forEach((img, i) => {
          if (!where?.villaId || img.villaId === where.villaId) {
            this.data.villa_images[i] = { ...img, ...data };
            count++;
          }
        });
        this.save();
        return { count };
      },
      delete: async ({ where }: any) => {
        const index = this.data.villa_images.findIndex((img) => img.id === where.id);
        if (index === -1) throw new Error('Foto tidak ditemukan');
        const [deleted] = this.data.villa_images.splice(index, 1);
        this.save();
        return deleted;
      },
      deleteMany: async ({ where }: any) => {
        this.data.villa_images = this.data.villa_images.filter((img) => img.villaId !== where.villaId);
        this.save();
        return { count: 0 };
      },
    };
  }

  public get villaFacility() {
    return {
      findMany: async ({ where }: any = {}) => {
        return this.data.villa_facilities.filter((f) => (!where?.villaId ? true : f.villaId === where.villaId));
      },
      create: async ({ data }: any) => {
        const record: VillaFacilityRecord = {
          ...data,
          id: `fac-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
        };
        this.data.villa_facilities.push(record);
        this.save();
        return record;
      },
      update: async ({ where, data }: any) => {
        const index = this.data.villa_facilities.findIndex((f) => f.id === where.id);
        if (index === -1) throw new Error('Fasilitas tidak ditemukan');
        this.data.villa_facilities[index] = { ...this.data.villa_facilities[index], ...data };
        this.save();
        return this.data.villa_facilities[index];
      },
      delete: async ({ where }: any) => {
        const index = this.data.villa_facilities.findIndex((f) => f.id === where.id);
        if (index === -1) throw new Error('Fasilitas tidak ditemukan');
        const [deleted] = this.data.villa_facilities.splice(index, 1);
        this.save();
        return deleted;
      },
      deleteMany: async ({ where }: any) => {
        this.data.villa_facilities = this.data.villa_facilities.filter((f) => f.villaId !== where.villaId);
        this.save();
        return { count: 0 };
      },
    };
  }

  public get villaPricing() {
    return {
      findMany: async ({ where }: any = {}) => {
        return this.data.villa_pricing.filter((p) => (!where?.villaId ? true : p.villaId === where.villaId));
      },
      create: async ({ data }: any) => {
        const record: VillaPricingRecord = {
          ...data,
          id: `price-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          startDate: typeof data.startDate === 'string' ? data.startDate.split('T')[0] : data.startDate.toISOString().split('T')[0],
          endDate: typeof data.endDate === 'string' ? data.endDate.split('T')[0] : data.endDate.toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        this.data.villa_pricing.push(record);
        this.save();
        return record;
      },
      delete: async ({ where }: any) => {
        const index = this.data.villa_pricing.findIndex((p) => p.id === where.id);
        if (index === -1) throw new Error('Aturan harga tidak ditemukan');
        const [deleted] = this.data.villa_pricing.splice(index, 1);
        this.save();
        return deleted;
      },
      deleteMany: async ({ where }: any) => {
        this.data.villa_pricing = this.data.villa_pricing.filter((p) => p.villaId !== where.villaId);
        this.save();
        return { count: 0 };
      },
    };
  }

  public get booking() {
    return {
      findUnique: async ({ where, include }: any) => {
        const b = this.data.bookings.find((item) =>
          where.id ? item.id === where.id : where.bookingReference ? item.bookingReference === where.bookingReference : false
        );
        if (!b) return null;
        return this.attachBookingRelations(b, include);
      },
      findFirst: async ({ where, include }: any) => {
        const items = await this.booking.findMany({ where, include });
        return items[0] || null;
      },
      findMany: async ({ where, include, orderBy, skip, take }: any = {}) => {
        let results = [...this.data.bookings];

        if (where) {
          if (where.id?.not) {
            results = results.filter((b) => b.id !== where.id.not);
          }
          if (where.villaId) {
            results = results.filter((b) => b.villaId === where.villaId);
          }
          if (where.status) {
            results = results.filter((b) => b.status === where.status);
          }
          if (where.checkIn?.gte) {
            const gteTime = new Date(where.checkIn.gte).getTime();
            results = results.filter((b) => new Date(b.checkIn).getTime() >= gteTime);
          }
          if (where.checkOut?.lte) {
            const lteTime = new Date(where.checkOut.lte).getTime();
            results = results.filter((b) => new Date(b.checkOut).getTime() <= lteTime);
          }

          // Overlap condition matching:
          // AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gt: checkInDate } }, { OR: [...] }]
          if (where.AND) {
            for (const cond of where.AND) {
              if (cond.checkIn?.lt) {
                const ltTime = new Date(cond.checkIn.lt).getTime();
                results = results.filter((b) => new Date(b.checkIn).getTime() < ltTime);
              }
              if (cond.checkOut?.gt) {
                const gtTime = new Date(cond.checkOut.gt).getTime();
                results = results.filter((b) => new Date(b.checkOut).getTime() > gtTime);
              }
              if (cond.OR) {
                results = results.filter((b) => {
                  return cond.OR.some((orClause: any) => {
                    if (orClause.status === 'CONFIRMED' && b.status === 'CONFIRMED') return true;
                    if (orClause.status === 'PENDING' && b.status === 'PENDING') {
                      if (orClause.expiresAt?.gt) {
                        return b.expiresAt && new Date(b.expiresAt).getTime() > new Date(orClause.expiresAt.gt).getTime();
                      }
                      return true;
                    }
                    return false;
                  });
                });
              }
            }
          }

          if (where.OR && Array.isArray(where.OR)) {
            results = results.filter((b) => {
              return where.OR.some((orClause: any) => {
                if (orClause.status === 'CONFIRMED' && b.status === 'CONFIRMED') return true;
                if (orClause.status === 'PENDING' && b.status === 'PENDING') {
                  if (orClause.expiresAt?.gt) {
                    return b.expiresAt && new Date(b.expiresAt).getTime() > new Date(orClause.expiresAt.gt).getTime();
                  }
                  return true;
                }
                if (orClause.bookingReference?.contains) {
                  return b.bookingReference.toLowerCase().includes(orClause.bookingReference.contains.toLowerCase());
                }
                if (orClause.customerName?.contains) {
                  return b.customerName.toLowerCase().includes(orClause.customerName.contains.toLowerCase());
                }
                if (orClause.customerPhone?.contains) {
                  return b.customerPhone.toLowerCase().includes(orClause.customerPhone.contains.toLowerCase());
                }
                return false;
              });
            });
          }
        }

        // Sorting
        if (orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Pagination
        if (skip !== undefined) {
          results = results.slice(skip);
        }
        if (take !== undefined) {
          results = results.slice(0, take);
        }

        return results.map((b) => this.attachBookingRelations(b, include));
      },
      count: async ({ where }: any = {}) => {
        const items = await this.booking.findMany({ where });
        return items.length;
      },
      create: async ({ data, include }: any) => {
        const record: BookingRecord = {
          ...data,
          id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          checkIn: typeof data.checkIn === 'string' ? data.checkIn.split('T')[0] : data.checkIn.toISOString().split('T')[0],
          checkOut: typeof data.checkOut === 'string' ? data.checkOut.split('T')[0] : data.checkOut.toISOString().split('T')[0],
          expiresAt: data.expiresAt ? (typeof data.expiresAt === 'string' ? data.expiresAt : data.expiresAt.toISOString()) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.bookings.push(record);
        this.save();
        return this.attachBookingRelations(record, include);
      },
      update: async ({ where, data }: any) => {
        const index = this.data.bookings.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error('Booking tidak ditemukan');
        this.data.bookings[index] = {
          ...this.data.bookings[index],
          ...data,
          expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? (typeof data.expiresAt === 'string' ? data.expiresAt : data.expiresAt.toISOString()) : null) : this.data.bookings[index].expiresAt,
          updatedAt: new Date().toISOString(),
        };
        this.save();
        return this.data.bookings[index];
      },
    };
  }

  private attachBookingRelations(booking: BookingRecord, include: any = {}) {
    const result: any = {
      ...booking,
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
      expiresAt: booking.expiresAt ? new Date(booking.expiresAt) : null,
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
    };

    if (include?.villa) {
      result.villa = this.data.villas.find((v) => v.id === booking.villaId) || null;
    }
    if (include?.statusLogs) {
      result.statusLogs = this.data.booking_status_logs
        .filter((l) => l.bookingId === booking.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((l) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          changedBy: this.data.admins.find((a) => a.id === l.changedById) || null,
        }));
    }
    return result;
  }

  public get blockedDate() {
    return {
      findFirst: async ({ where }: any) => {
        const items = await this.blockedDate.findMany({ where });
        return items[0] || null;
      },
      findMany: async ({ where, include, orderBy }: any = {}) => {
        let results = [...this.data.blocked_dates];

        if (where) {
          if (where.villaId) {
            results = results.filter((b) => b.villaId === where.villaId);
          }
          if (where.startDate?.lt) {
            const ltTime = new Date(where.startDate.lt).getTime();
            results = results.filter((b) => new Date(b.startDate).getTime() < ltTime);
          }
          if (where.endDate?.gt) {
            const gtTime = new Date(where.endDate.gt).getTime();
            results = results.filter((b) => new Date(b.endDate).getTime() > gtTime);
          }
        }

        if (orderBy?.startDate === 'asc') {
          results.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }

        return results.map((b) => ({
          ...b,
          startDate: new Date(b.startDate),
          endDate: new Date(b.endDate),
          createdAt: new Date(b.createdAt),
          createdBy: include?.createdBy ? this.data.admins.find((a) => a.id === b.createdById) || null : undefined,
        }));
      },
      create: async ({ data }: any) => {
        const record: BlockedDateRecord = {
          ...data,
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          startDate: typeof data.startDate === 'string' ? data.startDate.split('T')[0] : data.startDate.toISOString().split('T')[0],
          endDate: typeof data.endDate === 'string' ? data.endDate.split('T')[0] : data.endDate.toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        this.data.blocked_dates.push(record);
        this.save();
        return {
          ...record,
          startDate: new Date(record.startDate),
          endDate: new Date(record.endDate),
        };
      },
      delete: async ({ where }: any) => {
        const index = this.data.blocked_dates.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error('Data blokir tidak ditemukan');
        const [deleted] = this.data.blocked_dates.splice(index, 1);
        this.save();
        return deleted;
      },
    };
  }

  public get bookingStatusLog() {
    return {
      create: async ({ data }: any) => {
        const record: BookingStatusLogRecord = {
          ...data,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
        };
        this.data.booking_status_logs.push(record);
        this.save();
        return record;
      },
    };
  }

  public get setting() {
    return {
      findUnique: async ({ where }: { where: { key: string } }) => {
        return this.data.settings.find((s) => s.key === where.key) || null;
      },
      findMany: async () => this.data.settings,
      upsert: async ({ where, update, create }: any) => {
        const index = this.data.settings.findIndex((s) => s.key === where.key);
        if (index >= 0) {
          this.data.settings[index] = {
            ...this.data.settings[index],
            ...update,
            updatedAt: new Date().toISOString(),
          };
          this.save();
          return this.data.settings[index];
        } else {
          const record: SettingRecord = {
            ...create,
            id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            updatedAt: new Date().toISOString(),
          };
          this.data.settings.push(record);
          this.save();
          return record;
        }
      },
    };
  }

  public async $transaction<T>(callback: (tx: JsonDatabase) => Promise<T>): Promise<T> {
    // In-process atomic transaction execution
    return callback(this);
  }
}

// Export singleton database instance
export const db = new JsonDatabase();
export default db;
