import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';

dotenv.config();

const createSupplier = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Find the organization
    const org = await Organization.findOne({ email: 'admin@invoiceai.com' });
    if (!org) {
      console.log('❌ Organization not found. Please create admin account first.');
      process.exit(1);
    }

    // Check if supplier already exists
    const existingSupplier = await User.findOne({ email: 'supplier@invoiceai.com' });
    if (existingSupplier) {
      console.log('✅ Supplier account already exists');
      console.log('Email: supplier@invoiceai.com');
      console.log('Password: supplier123');
      process.exit(0);
    }

    // Create supplier user
    const supplier = await User.create({
      name: 'Test Supplier',
      email: 'supplier@invoiceai.com',
      password: 'supplier123',
      role: 'supplier',
      organizationId: org._id,
      status: 'active'
    });

    console.log('✅ Supplier account created');
    console.log('Email: supplier@invoiceai.com');
    console.log('Password: supplier123');
    console.log('Organization:', org.name);
    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('Email: supplier@invoiceai.com');
    console.log('Password: supplier123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createSupplier();
