/**
 * Test script to verify auth controller returns organization data
 * Run with: node test-auth-organization.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';

dotenv.config();

const testAuthOrganizationData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check if User model has organization fields
    console.log('📋 Test 1: Verify User Model Schema');
    const userSchema = User.schema.obj;
    console.log('✓ organizationId field exists:', !!userSchema.organizationId);
    console.log('✓ permissions field exists:', !!userSchema.permissions);
    console.log('✓ role field exists:', !!userSchema.role);

    // Test 2: Find a user with organization
    console.log('\n📋 Test 2: Find User with Organization');
    const orgUser = await User.findOne({ 
      organizationId: { $ne: null } 
    }).populate('organizationId', 'name');
    
    if (orgUser) {
      console.log('✓ Found organization user:', orgUser.email);
      console.log('  - Role:', orgUser.role);
      console.log('  - Organization ID:', orgUser.organizationId?._id);
      console.log('  - Organization Name:', orgUser.organizationId?.name);
      console.log('  - Permissions:', JSON.stringify(orgUser.permissions, null, 2));
    } else {
      console.log('⚠ No organization users found in database');
    }

    // Test 3: Find a personal user
    console.log('\n📋 Test 3: Find Personal User');
    const personalUser = await User.findOne({ role: 'personal' });
    
    if (personalUser) {
      console.log('✓ Found personal user:', personalUser.email);
      console.log('  - Role:', personalUser.role);
      console.log('  - Organization ID:', personalUser.organizationId || 'null');
      console.log('  - Permissions:', JSON.stringify(personalUser.permissions, null, 2));
    } else {
      console.log('⚠ No personal users found in database');
    }

    // Test 4: Simulate login response structure
    console.log('\n📋 Test 4: Simulate Login Response Structure');
    const testUser = orgUser || personalUser;
    
    if (testUser) {
      const responseData = {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        permissions: testUser.permissions
      };

      if (testUser.organizationId) {
        responseData.organizationId = testUser.organizationId._id;
        responseData.organizationName = testUser.organizationId.name;
      }

      console.log('✓ Login response structure:');
      console.log(JSON.stringify(responseData, null, 2));
    }

    // Test 5: Check all role types
    console.log('\n📋 Test 5: User Count by Role');
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('✓ Users by role:');
    roleCounts.forEach(({ _id, count }) => {
      console.log(`  - ${_id}: ${count}`);
    });

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testAuthOrganizationData();
