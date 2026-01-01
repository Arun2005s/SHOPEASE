import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'arunrealm2005@gmail.com';
    const adminPassword = 'arun2005';

    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin...');
      const newAdmin = new User({
        name: 'Arun Admin',
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Admin user created:', adminEmail);
    } else {
      // Reset password - setting it directly will trigger pre-save hook
      admin.password = adminPassword;
      admin.role = 'admin'; // Ensure role is admin
      await admin.save();
      console.log('✅ Admin password reset:', adminEmail);
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();

