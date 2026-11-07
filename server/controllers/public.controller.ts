import { Request, Response, NextFunction } from 'express';
import { VillaService } from '../services/villa.service.js';
import { AvailabilityService } from '../services/availability.service.js';
import { BookingService } from '../services/booking.service.js';
import { checkAvailabilitySchema, createInquirySchema } from '../validators/booking.validator.js';

export class PublicController {
  /**
   * GET /api/villas
   */
  static async getVillas(req: Request, res: Response, next: NextFunction) {
    try {
      const villas = await VillaService.getAllVillas();
      res.json({ success: true, data: villas });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/villas/:id
   */
  static async getVilla(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const villa = id === 'primary' 
        ? await VillaService.getPrimaryVilla() 
        : await VillaService.getVillaByIdOrSlug(id);
      res.json({ success: true, data: villa });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/villas/:id/availability
   */
  static async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      if (id === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        id = primary.id;
      }

      // If query parameters checkIn & checkOut are provided, check specific interval
      if (req.query.checkIn && req.query.checkOut) {
        const query = checkAvailabilitySchema.parse({
          checkIn: req.query.checkIn,
          checkOut: req.query.checkOut,
          guests: req.query.guests,
        });

        const result = await AvailabilityService.checkAvailability(
          id,
          query.checkIn,
          query.checkOut,
          query.guests
        );

        res.json({ success: true, data: result });
        return;
      }

      // Otherwise return calendar occupied dates
      const calendar = await AvailabilityService.getOccupiedDates(
        id,
        req.query.from as string,
        req.query.to as string
      );
      res.json({ success: true, data: calendar });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/villas/:id/pricing
   */
  static async getPricing(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      if (id === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        id = primary.id;
      }
      const villa = await VillaService.getVillaByIdOrSlug(id);
      res.json({
        success: true,
        data: {
          basePriceIdr: villa.basePriceIdr,
          weekendPriceIdr: villa.weekendPriceIdr,
          customRules: villa.pricing,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bookings/inquiry
   */
  static async createInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInquirySchema.parse(req.body);

      // If client sent villaId = 'primary', resolve to actual uuid
      if (data.villaId === 'primary') {
        const primary = await VillaService.getPrimaryVilla();
        data.villaId = primary.id;
      }

      const result = await BookingService.createInquiry(data);
      res.status(201).json({
        success: true,
        message: 'Inquiry booking berhasil dibuat. Silakan lanjutkan konfirmasi melalui WhatsApp.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/:reference
   */
  static async getBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.params;
      const booking = await BookingService.getByReference(reference);
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }
}
