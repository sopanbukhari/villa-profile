import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdminAuth } from '../middlewares/auth.js';

const router = Router();

// Authentication
router.post('/auth/login', AdminController.login);
router.post('/auth/logout', AdminController.logout);
router.get('/auth/me', requireAdminAuth as any, AdminController.me);

// Protected Admin Operations
router.use(requireAdminAuth as any);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Bookings
router.get('/bookings', AdminController.getBookings);
router.patch('/bookings/:id/status', AdminController.updateBookingStatus);

// Blocked Dates
router.get('/blocked-dates', AdminController.listBlockedDates);
router.post('/blocked-dates', AdminController.createBlockedDate);
router.delete('/blocked-dates/:id', AdminController.deleteBlockedDate);

// Villa details
router.patch('/villas/:id', AdminController.updateVilla);

// Gallery
router.post('/gallery', AdminController.addGalleryImage);
router.patch('/gallery/:id', AdminController.updateGalleryImage);
router.delete('/gallery/:id', AdminController.deleteGalleryImage);

// Facilities
router.post('/facilities', AdminController.addFacility);
router.patch('/facilities/:id', AdminController.updateFacility);
router.delete('/facilities/:id', AdminController.deleteFacility);

// Pricing Rules
router.post('/pricing', AdminController.addPricingRule);
router.delete('/pricing/:id', AdminController.deletePricingRule);

// Settings
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);

export default router;
