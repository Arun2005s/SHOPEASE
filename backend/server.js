// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import User from './models/User.js';

// Debug: Log all environment variables (without exposing secrets)
console.log('📋 Environment variables check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set (' + process.env.CLOUDINARY_CLOUD_NAME + ')' : '❌ Missing');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

const app = express();

// Middleware - CORS Configuration
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : isProduction 
    ? [] // In production, require FRONTEND_URL to be set
    : ['http://localhost:5173']; // Only use localhost fallback in development

// Warn if FRONTEND_URL is not set in production
if (isProduction && !process.env.FRONTEND_URL) {
  console.warn('⚠️  WARNING: FRONTEND_URL is not set in production! CORS may block requests.');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) only in development
    if (!origin) {
      return callback(isProduction ? new Error('Not allowed by CORS') : null, !isProduction);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (!isProduction) {
      // In development, allow all origins for easier testing
      callback(null, true);
    } else {
      // In production, strictly enforce allowed origins
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin();
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'arunrealm2005@gmail.com';
    const adminPassword = 'arun2005';
    const adminName = 'Arun Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Create new admin - password will be hashed by pre-save hook
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Plain password - will be hashed by pre-save hook
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default admin user created:', adminEmail);
    } else {
      // Update existing user: ensure it's admin and reset password
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword; // Will be re-hashed by pre-save hook
      await existingAdmin.save();
      console.log('✅ Updated user to admin and reset password:', adminEmail);
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

