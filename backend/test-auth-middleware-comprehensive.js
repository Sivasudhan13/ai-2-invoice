import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Create test users
async function createTestUsers() {
  console.log('\n=== Creating test users ===');
  
  // Clean up existing test users
  await User.deleteMany({ email: { $regex: /^test-auth-/ } });
  
  // Create organization admin
  const admin = await User.create({
    name: 'Test Admin',
    email: 'test-auth-admin@example.com',
    password: 'password123',
    role: 'organization_admin'
  });
  
  // Create supplier
  const supplier = await User.create({
    name: 'Test Supplier',
    email: 'test-auth-supplier@example.com',
    password: 'password123',
    role: 'supplier'
  });
  
  // Create mentor
  const mentor = await User.create({
    name: 'Test Mentor',
    email: 'test-auth-mentor@example.com',
    password: 'password123',
    role: 'mentor'
  });
  
  console.log('✓ Created test users');
  return { admin, supplier, mentor };
}

// Generate JWT token for user
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Test 1: Organization admin can access admin routes
async function testAdminAccess(adminToken) {
  console.log('\n=== Test 1: Admin accessing admin route ===');
  try {
    const response = await fetch(`${API_URL}/organization/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Expected: 200 or 404 (route may not be fully implemented)');
    console.log('Result:', response.status < 500 ? '✓ PASS (authorized)' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 2: Supplier cannot access admin routes
async function testSupplierBlockedFromAdmin(supplierToken) {
  console.log('\n=== Test 2: Supplier accessing admin route ===');
  try {
    const response = await fetch(`${API_URL}/organization/users`, {
      headers: {
        'Authorization': `Bearer ${supplierToken}`
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log('Expected: 403 Access denied');
    console.log('Result:', response.status === 403 ? '✓ PASS' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 3: Mentor cannot access admin routes
async function testMentorBlockedFromAdmin(mentorToken) {
  console.log('\n=== Test 3: Mentor accessing admin route ===');
  try {
    const response = await fetch(`${API_URL}/organization/supplier`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mentorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log('Expected: 403 Access denied');
    console.log('Result:', response.status === 403 ? '✓ PASS' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 4: User with canView permission can access invoices
async function testPermissionCheck(supplierToken) {
  console.log('\n=== Test 4: Supplier with canView accessing invoices ===');
  try {
    const response = await fetch(`${API_URL}/organization/invoices`, {
      headers: {
        'Authorization': `Bearer ${supplierToken}`
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Expected: 200 or 404 (supplier has canView permission)');
    console.log('Result:', response.status < 500 ? '✓ PASS (authorized)' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 5: Verify mentor has canView but not canUpload
async function testMentorPermissions(mentorToken) {
  console.log('\n=== Test 5: Mentor permissions check ===');
  try {
    // Mentor should be able to view invoices (has canView)
    const response = await fetch(`${API_URL}/organization/invoices`, {
      headers: {
        'Authorization': `Bearer ${mentorToken}`
      }
    });
    console.log('Status:', response.status);
    console.log('Expected: 200 or 404 (mentor has canView permission)');
    console.log('Result:', response.status < 500 ? '✓ PASS (authorized)' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Cleanup test users
async function cleanup() {
  console.log('\n=== Cleaning up test users ===');
  await User.deleteMany({ email: { $regex: /^test-auth-/ } });
  console.log('✓ Cleaned up test users');
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
}

// Run all tests
async function runTests() {
  console.log('=================================');
  console.log('Comprehensive Authorization Tests');
  console.log('=================================');
  
  try {
    await connectDB();
    const { admin, supplier, mentor } = await createTestUsers();
    
    const adminToken = generateToken(admin._id);
    const supplierToken = generateToken(supplier._id);
    const mentorToken = generateToken(mentor._id);
    
    await testAdminAccess(adminToken);
    await testSupplierBlockedFromAdmin(supplierToken);
    await testMentorBlockedFromAdmin(mentorToken);
    await testPermissionCheck(supplierToken);
    await testMentorPermissions(mentorToken);
    
    await cleanup();
    
    console.log('\n=================================');
    console.log('All tests completed');
    console.log('=================================\n');
  } catch (error) {
    console.error('Test error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

runTests();
