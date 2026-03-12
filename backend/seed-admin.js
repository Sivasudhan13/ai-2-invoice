import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';

dotenv.config();

const createAdminAccount = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to database\n');

    // Admin credentials
    const adminEmail = 'admin@invoiceai.com';
    const adminPassword = 'Admin@123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('❌ Admin account already exists!');
      console.log('\n📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('\nYou can use these credentials to login.\n');
      await mongoose.disconnect();
      return;
    }

    console.log('Creating organization admin account...\n');

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'organization_admin'
    });

    console.log('✅ Admin user created');

    // Create organization
    const organization = await Organization.create({
      name: 'InvoiceAI Organization',
      email: adminEmail,
      address: '123 Business Street, Tech City',
      phone: '+1 234 567 8900',
      adminId: admin._id,
      status: 'active'
    });

    console.log('✅ Organization created');

    // Update admin with organizationId
    admin.organizationId = organization._id;
    await admin.save();

    console.log('✅ Admin linked to organization\n');

    console.log('═══════════════════════════════════════');
    console.log('   ORGANIZATION ADMIN ACCOUNT CREATED   ');
    console.log('═══════════════════════════════════════\n');
    console.log('📧 Email:        ', adminEmail);
    console.log('🔑 Password:     ', adminPassword);
    console.log('👤 Name:         ', adminName);
    console.log('🏢 Organization: ', organization.name);
    console.log('🆔 Org ID:       ', organization._id);
    console.log('👑 Role:         ', admin.role);
    console.log('\n═══════════════════════════════════════\n');
    console.log('You can now login with these credentials!\n');

    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminAccount();
