import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../server/app.js';
import db from '../../server/db/jsonDb.js';

describe('End-to-End System Tests with JSON Database', () => {
  let createdBookingId = '';
  let createdBookingReference = '';
  let adminToken = '';

  beforeAll(() => {
    db.reset();
  });

  it('Scenario 1 & 2: Public user fetches primary villa details and facilities', async () => {
    const res = await request(app).get('/api/villas/primary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Villa Paradise Sanctuary');
    expect(res.body.data.bedrooms).toBe(3);
    expect(res.body.data.images.length).toBeGreaterThan(0);
    expect(res.body.data.facilities.length).toBeGreaterThan(0);
  });

  it('Scenario 3: Public user queries availability for a valid future stay', async () => {
    const res = await request(app).get(
      '/api/villas/primary/availability?checkIn=2027-02-10&checkOut=2027-02-13&guests=4'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.available).toBe(true);
    expect(res.body.data.nights).toBe(3);
    expect(res.body.data.totalEstimatedPrice).toBeGreaterThan(0);
    expect(res.body.data.breakdown.length).toBe(3);
  });

  it('Scenario 13, 14, 15: Customer submits a booking inquiry and receives WhatsApp redirect link', async () => {
    const inquiryPayload = {
      villaId: 'primary',
      customerName: 'Budi Santoso',
      customerPhone: '081234567890',
      customerEmail: 'budi@example.com',
      checkIn: '2027-02-10',
      checkOut: '2027-02-13',
      guestCount: 4,
      specialRequests: 'Perlu baby cot dan penjemputan bandara',
    };

    const res = await request(app).post('/api/bookings/inquiry').send(inquiryPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking.bookingReference).toMatch(/^VIL-\d{6}-[0-9A-F]{6}$/);
    expect(res.body.data.booking.status).toBe('INQUIRY');
    expect(res.body.data.whatsappLink).toContain('https://wa.me/6281234567890?text=');
    expect(res.body.data.whatsappMessage).toContain('Budi Santoso');

    createdBookingId = res.body.data.booking.id;
    createdBookingReference = res.body.data.booking.bookingReference;
  });

  it('Customer can view booking details by reference', async () => {
    const res = await request(app).get(`/api/bookings/${createdBookingReference}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingReference).toBe(createdBookingReference);
    expect(res.body.data.customerName).toBe('Budi Santoso');
  });

  it('Scenario 16: Admin logs in with seeded credentials and receives JWT', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({
      email: 'admin@villaparadise.com',
      password: 'SecureAdminPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.admin.email).toBe('admin@villaparadise.com');

    adminToken = res.body.data.token;
  });

  it('Admin accesses dashboard KPI metrics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalBookings).toBeGreaterThanOrEqual(1);
    expect(res.body.data.recentBookings.length).toBeGreaterThanOrEqual(1);
  });

  it('Scenario 17: Admin updates inquiry status to PENDING (holding window)', async () => {
    const res = await request(app)
      .patch(`/api/admin/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PENDING',
        holdHours: 24,
        notes: 'Hold 24 jam untuk menunggu transfer DP tamu',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.expiresAt).toBeDefined();
  });

  it('Scenario 10: Date range is now unavailable for another guest due to active pending hold', async () => {
    const res = await request(app).get(
      '/api/villas/primary/availability?checkIn=2027-02-11&checkOut=2027-02-14&guests=2'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.available).toBe(false);
    expect(res.body.data.reason).toContain('hold');
  });

  it('Admin updates status to CONFIRMED after payment verification', async () => {
    const res = await request(app)
      .patch(`/api/admin/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'CONFIRMED',
        notes: 'DP 50% telah diterima dan diverifikasi via rekening BCA',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('Scenario 8: Date range is strictly UNAVAILABLE after booking is confirmed', async () => {
    const res = await request(app).get(
      '/api/villas/primary/availability?checkIn=2027-02-10&checkOut=2027-02-13&guests=2'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.available).toBe(false);
    expect(res.body.data.reason).toContain('Confirmed');
  });

  it('Admin blocks dates for routine maintenance (BR-005)', async () => {
    const res = await request(app)
      .post('/api/admin/blocked-dates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        villaId: 'primary',
        startDate: '2027-03-01',
        endDate: '2027-03-05',
        reason: 'Pembersihan tahunan kolam renang infinity',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify blocked dates query
    const checkRes = await request(app).get(
      '/api/villas/primary/availability?checkIn=2027-03-02&checkOut=2027-03-04&guests=2'
    );
    expect(checkRes.body.data.available).toBe(false);
    expect(checkRes.body.data.reason).toContain('kolam renang');
  });

  it('Admin updates WhatsApp target number dynamically without source code change', async () => {
    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        WHATSAPP_NUMBER: '6289876543210',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.WHATSAPP_NUMBER).toBe('6289876543210');

    // Next inquiry uses the new number
    const inquiryRes = await request(app).post('/api/bookings/inquiry').send({
      villaId: 'primary',
      customerName: 'Siti Rahma',
      customerPhone: '081122334455',
      checkIn: '2027-04-01',
      checkOut: '2027-04-03',
      guestCount: 2,
    });

    expect(inquiryRes.body.data.whatsappLink).toContain('https://wa.me/6289876543210?text=');
  });
});
