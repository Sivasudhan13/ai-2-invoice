import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';

dotenv.config();

const createOrgAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@invoiceai.com' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log('Email: admin@invoiceai.com');
      console.log('Password: admin123');
      
      // Check if organization exists
      const org = await Organization.findOne({ adminId: existingAdmin._id });
      if (org) {
        console.log('Organization:', org.name);
        console.log('Organization ID:', org._id);
      }
      
      process.exit(0);
    }

    // Create organization admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@invoiceai.com',
      password: 'admin123',
      role: 'organization_admin'
    });

    console.log('✅ Admin user created');
    console.log('Email: admin@invoiceai.com');
    console.log('Password: admin123');

    // Create organization
    const organization = await Organization.create({
      name: 'InvoiceAI Organization',
      email: 'admin@invoiceai.com',
      address: '123 Business Street',
      phone: '+1234567890',
      adminId: admin._id
    });

    console.log('✅ Organization created');
    console.log('Organization:', organization.name);
    console.log('Organization ID:', organization._id);

    // Update admin with organizationId
    admin.organizationId = organization._id;
    await admin.save();

    console.log('✅ Admin linked to organization');
    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('Email: admin@invoiceai.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createOrgAdmin();
