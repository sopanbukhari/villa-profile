import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@villaparadise.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPassword123!';
  const adminName = process.env.ADMIN_NAME || 'Admin Villa Paradise';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: adminName,
      role: 'ADMIN',
    },
  });
  console.log(`✓ Admin user configured: ${admin.email}`);

  // 2. Seed Villa
  const villaSlug = 'villa-paradise-sanctuary';
  const villa = await prisma.villa.upsert({
    where: { slug: villaSlug },
    update: {
      name: 'Villa Paradise Sanctuary',
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
    },
    create: {
      name: 'Villa Paradise Sanctuary',
      slug: villaSlug,
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
    },
  });
  console.log(`✓ Villa created: ${villa.name} (${villa.id})`);

  // 3. Seed Images
  await prisma.villaImage.deleteMany({ where: { villaId: villa.id } });
  const sampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      caption: 'Main Villa Exterior & Tropical Sun Deck',
      isPrimary: true,
      displayOrder: 1,
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
      caption: 'Private Infinity Pool Overlooking Rainforest',
      isPrimary: false,
      displayOrder: 2,
    },
    {
      url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
      caption: 'Open-Air Living Pavilion & Dining Area',
      isPrimary: false,
      displayOrder: 3,
    },
    {
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
      caption: 'Master Suite with King Bed & Forest View',
      isPrimary: false,
      displayOrder: 4,
    },
    {
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
      caption: 'En-suite Luxury Marble Bathroom with Terrazzo Tub',
      isPrimary: false,
      displayOrder: 5,
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      caption: 'Fully Equipped Gourmet Kitchen and Island Bar',
      isPrimary: false,
      displayOrder: 6,
    },
  ];

  for (const img of sampleImages) {
    await prisma.villaImage.create({
      data: {
        villaId: villa.id,
        ...img,
      },
    });
  }
  console.log(`✓ Seeded ${sampleImages.length} gallery images`);

  // 4. Seed Facilities
  await prisma.villaFacility.deleteMany({ where: { villaId: villa.id } });
  const sampleFacilities = [
    {
      name: 'Private Infinity Pool',
      category: 'Living & Outdoor',
      icon: 'waves',
      description: 'Kolam renang air tawar pribadi dengan pemandangan lembah tropis spektakuler.',
      isFeatured: true,
    },
    {
      name: 'High-Speed Wi-Fi 100 Mbps',
      category: 'Living & Outdoor',
      icon: 'wifi',
      description: 'Koneksi internet serat optik stabil dan cepat di seluruh area villa.',
      isFeatured: true,
    },
    {
      name: 'Air Conditioning di Setiap Kamar',
      category: 'Bedroom & Bath',
      icon: 'wind',
      description: 'Unit AC inverter senyap di seluruh 3 kamar tidur.',
      isFeatured: true,
    },
    {
      name: 'En-suite Marble Bathroom & Bathtub',
      category: 'Bedroom & Bath',
      icon: 'bath',
      description: 'Bak mandi terrazzo berendam mewah dengan view taman semi terbuka.',
      isFeatured: true,
    },
    {
      name: 'Gourmet Kitchen & Espresso Bar',
      category: 'Kitchen & Dining',
      icon: 'coffee',
      description: 'Dapur lengkap dengan oven, kulkas 2 pintu, kompor induksi, dan mesin kopi kapsul.',
      isFeatured: true,
    },
    {
      name: 'Smart TV 65" dengan Netflix',
      category: 'Entertainment',
      icon: 'tv',
      description: 'Smart TV UHD dengan soundbar cinematic di ruang tamu utama.',
      isFeatured: false,
    },
    {
      name: 'Daily Housekeeping & Turndown',
      category: 'Services',
      icon: 'sparkles',
      description: 'Layanan kebersihan harian profesional untuk kenyamanan maksimal.',
      isFeatured: true,
    },
    {
      name: 'Private Parking & 24/7 Security',
      category: 'Services',
      icon: 'shield-check',
      description: 'Area parkir mobil pribadi dengan gerbang otomatis dan pengawasan 24 jam.',
      isFeatured: false,
    },
  ];

  for (const fac of sampleFacilities) {
    await prisma.villaFacility.create({
      data: {
        villaId: villa.id,
        ...fac,
      },
    });
  }
  console.log(`✓ Seeded ${sampleFacilities.length} facilities`);

  // 5. Seed Seasonal Pricing
  await prisma.villaPricing.deleteMany({ where: { villaId: villa.id } });
  await prisma.villaPricing.create({
    data: {
      villaId: villa.id,
      name: 'End of Year Peak Season',
      startDate: new Date(Date.UTC(2026, 11, 20)),
      endDate: new Date(Date.UTC(2027, 0, 5)),
      pricePerNightIdr: 5500000,
      minStayNights: 2,
    },
  });
  console.log(`✓ Seeded peak season pricing rule`);

  // 6. Seed Settings
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '6281234567890';
  const settingsList = [
    {
      key: 'WHATSAPP_NUMBER',
      value: whatsappNumber,
      description: 'Nomor WhatsApp admin untuk menerima inquiry booking customer',
    },
    {
      key: 'VILLA_NAME',
      value: 'Villa Paradise Sanctuary',
      description: 'Nama properti villa',
    },
    {
      key: 'CONTACT_PHONE',
      value: '+62 812-3456-7890',
      description: 'Nomor telepon kontak resmi',
    },
    {
      key: 'CONTACT_EMAIL',
      value: 'booking@villaparadisesanctuary.com',
      description: 'Email resmi reservasi',
    },
    {
      key: 'ADDRESS',
      value: 'Jl. Raya Sayan No. 88, Ubud, Bali, Indonesia 80571',
      description: 'Alamat lengkap properti',
    },
    {
      key: 'CHECK_IN_TIME',
      value: '14:00',
      description: 'Waktu standar check-in',
    },
    {
      key: 'CHECK_OUT_TIME',
      value: '12:00',
      description: 'Waktu standar check-out',
    },
    {
      key: 'HOLD_HOURS',
      value: '24',
      description: 'Batas durasi hold booking (dalam jam) untuk status PENDING',
    },
    {
      key: 'CANCELLATION_POLICY',
      value:
        'Pembatalan gratis hingga 7 hari sebelum jadwal check-in. Pembatalan dalam kurun waktu 7 hari dikenakan biaya 50% dari total nilai pemesanan.',
      description: 'Kebijakan pembatalan reservasi',
    },
    {
      key: 'BOOKING_POLICY',
      value:
        'Reservasi dianggap sah setelah pembayaran uang muka (DP) minimal 50% diterima dan dikonfirmasi oleh Admin Villa.',
      description: 'Ketentuan pemesanan',
    },
  ];

  for (const s of settingsList) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log(`✓ Seeded ${settingsList.length} configuration settings`);

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
