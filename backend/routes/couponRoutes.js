import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  applyCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

// Admin routes
router.post('/', authenticate, isAdmin, createCoupon);
router.get('/', authenticate, isAdmin, getAllCoupons);
router.delete('/:id', authenticate, isAdmin, deleteCoupon);

// Customer routes
router.get('/active', authenticate, getActiveCoupons);
router.post('/apply', authenticate, applyCoupon);

export default router;

