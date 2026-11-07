import { Router } from 'express';
import { PublicController } from '../controllers/public.controller.js';

const router = Router();

// Villa info & availability
router.get('/villas', PublicController.getVillas);
router.get('/villas/:id', PublicController.getVilla);
router.get('/villas/:id/availability', PublicController.checkAvailability);
router.get('/villas/:id/pricing', PublicController.getPricing);

// Bookings
router.post('/bookings/inquiry', PublicController.createInquiry);
router.get('/bookings/:reference', PublicController.getBooking);

export default router;
