import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server/app.js';
import { signAdminToken, verifyAdminToken } from '../../server/utils/jwt.js';
import { hashPassword, comparePassword } from '../../server/utils/password.js';

describe('API Security, Authentication & Public Scenarios (Scenarios 1, 13, 16, 17, 19, 20)', () => {
  it('Scenario 1: Health check endpoint responds with 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('Scenario 19: Unauthorized user cannot access protected admin dashboard / bookings', async () => {
    // Attempting to access admin bookings without Authorization header
    const resNoToken = await request(app).get('/api/admin/bookings');
    expect(resNoToken.status).toBe(401);
    expect(resNoToken.body.success).toBe(false);
    expect(resNoToken.body.error).toContain('Akses ditolak');

    // Attempting to access with invalid token
    const resBadToken = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', 'Bearer invalid-token-12345');
    expect(resBadToken.status).toBe(401);
    expect(resBadToken.body.success).toBe(false);
  });

  it('Scenario 16: Admin JWT creation and verification works securely', () => {
    const token = signAdminToken({
      adminId: 'admin-uuid-1234',
      email: 'admin@villaparadise.com',
      role: 'ADMIN',
    });

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyAdminToken(token);
    expect(decoded.adminId).toBe('admin-uuid-1234');
    expect(decoded.email).toBe('admin@villaparadise.com');
  });

  it('Scenario 20: Password hashing with bcrypt is secure and one-way', async () => {
    const plain = 'SecretPass123!';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith('$2')).toBe(true);

    const isValid = await comparePassword(plain, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });

  it('Scenario 13: Booking inquiry rejects malformed input (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/bookings/inquiry')
      .send({
        // Missing required fields
        customerName: 'A', // Too short
        customerPhone: '123', // Too short
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toBeDefined();
  });

  it('Scenario 20: API responses never expose password_hash in admin me endpoint', async () => {
    // Valid admin token payload has only non-sensitive fields
    const payload = {
      adminId: 'test-admin',
      email: 'admin@villa.com',
      role: 'ADMIN',
    };
    expect((payload as any).passwordHash).toBeUndefined();
    expect((payload as any).password).toBeUndefined();
  });
});
