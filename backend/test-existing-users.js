/**
 * Test script to check existing users and their data structure
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const checkExistingUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).limit(5);
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Role:', user.role || 'NOT SET');
      console.log('  OrganizationId:', user.organizationId || 'null');
      console.log('  Permissions:', JSON.stringify(user.permissions || {}, null, 2));
      console.log('  AccountType:', user.accountType || 'NOT SET');
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

checkExistingUsers();
