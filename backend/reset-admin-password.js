import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const admin = await User.findOne({ role: 'organization_admin' });
    
    if (!admin) {
      console.log('No organization admin found!');
      process.exit(1);
    }

    console.log('Found admin:', admin.name, '(', admin.email, ')');
    console.log('\nResetting password to: password123');
    
    // Set the plain password - the pre-save hook will hash it
    admin.password = 'password123';
    await admin.save();
    
    console.log('✓ Password reset successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', admin.email);
    console.log('Password: password123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

resetPassword();
