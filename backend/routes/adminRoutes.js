import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

export default router;

