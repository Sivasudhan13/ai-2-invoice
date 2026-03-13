import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const admin = await User.findOne({ role: 'organization_admin' });
    
    if (!admin) {
      console.log('No organization admin found!');
      process.exit(1);
    }

    console.log('Organization Admin Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Organization ID:', admin.organizationId);
    console.log('\nTesting password: "password123"');
    
    const isMatch = await bcrypt.compare('password123', admin.password);
    console.log('Password matches:', isMatch);

    if (!isMatch) {
      console.log('\n⚠️ Password "password123" does NOT match!');
      console.log('\nResetting password to "password123"...');
      
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('password123', salt);
      await admin.save();
      
      console.log('✓ Password reset successfully!');
      console.log('\nYou can now login with:');
      console.log('Email:', admin.email);
      console.log('Password: password123');
    } else {
      console.log('\n✓ Password is correct!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkAdmin();
