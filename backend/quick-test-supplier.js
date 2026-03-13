// Quick test to verify create supplier endpoint
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const testSupplierCreation = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invoiceDB');
    console.log('✓ Connected to MongoDB\n');

    // Find an organization admin
    console.log('Finding organization admin...');
    const admin = await User.findOne({ role: 'organization_admin' });
    
    if (!admin) {
      console.error('✗ No organization admin found!');
      console.log('\nPlease create an organization admin first.');
      process.exit(1);
    }

    console.log('✓ Found admin:', admin.name, '(', admin.email, ')');
    console.log('  Organization ID:', admin.organizationId);
    console.log('  Role:', admin.role);

    // Check if test supplier already exists
    const testEmail = 'test-supplier-direct@example.com';
    const existing = await User.findOne({ email: testEmail });
    
    if (existing) {
      console.log('\nDeleting existing test supplier...');
      await User.deleteOne({ email: testEmail });
      console.log('✓ Deleted');
    }

    // Create supplier directly
    console.log('\nCreating supplier directly in database...');
    const supplier = await User.create({
      name: 'Test Supplier Direct',
      email: testEmail,
      password: 'password123',
      role: 'supplier',
      organizationId: admin.organizationId,
      status: 'active'
    });

    console.log('✓ Supplier created successfully!');
    console.log('  ID:', supplier._id);
    console.log('  Name:', supplier.name);
    console.log('  Email:', supplier.email);
    console.log('  Role:', supplier.role);
    console.log('  Organization ID:', supplier.organizationId);

    // Verify it was saved
    const verify = await User.findById(supplier._id);
    if (verify) {
      console.log('\n✓ Verified: Supplier exists in database');
    } else {
      console.error('\n✗ ERROR: Supplier not found after creation!');
    }

    // List all users in the organization
    console.log('\nAll users in organization:');
    const orgUsers = await User.find({ organizationId: admin.organizationId }).select('name email role');
    orgUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.email}) - ${u.role}`);
    });

    console.log('\n✓ Database operations work correctly!');
    console.log('\nIf this works but the API doesn\'t, the issue is in:');
    console.log('  1. Route configuration');
    console.log('  2. Middleware');
    console.log('  3. Request/response handling');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

testSupplierCreation();
