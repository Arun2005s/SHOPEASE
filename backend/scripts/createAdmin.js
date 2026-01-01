import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hardcoded admin credentials
    const email = 'arunrealm2005@gmail.com';
    const password = 'arun2005';
    const name = 'Arun Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.password = await bcrypt.hash(password, 10);
      existingAdmin.name = name;
      await existingAdmin.save();
      console.log(`✅ Updated existing user to admin: ${email}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

