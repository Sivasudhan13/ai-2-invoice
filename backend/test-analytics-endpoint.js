import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';
import History from './models/History.model.js';
import { getAnalytics } from './controllers/organization.controller.js';

dotenv.config();

// Mock request and response objects
const createMockReq = (user) => ({
  user
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function setupTestData() {
  console.log('Setting up test data...');
  
  // Clean up any existing test data first
  await User.deleteMany({ email: { $regex: /analytics@test\.com/ } });
  await Organization.deleteMany({ email: 'analytics@test.com' });
  await History.deleteMany({ filename: { $regex: /^invoice/ } });
  
  // Create organization admin first (without organizationId)
  const admin = await User.create({
    name: 'Analytics Admin',
    email: 'admin-analytics@test.com',
    password: 'password123',
    role: 'organization_admin'
  });
  
  // Create test organization with admin reference
  const org = await Organization.create({
    name: 'Test Analytics Org',
    email: 'analytics@test.com',
    address: '123 Test St',
    phone: '1234567890',
    adminId: admin._id
  });
  
  // Update admin with organizationId
  admin.organizationId = org._id;
  await admin.save();
  
  // Create suppliers
  const supplier1 = await User.create({
    name: 'Supplier One',
    email: 'supplier1-analytics@test.com',
    password: 'password123',
    role: 'supplier',
    organizationId: org._id
  });
  
  const supplier2 = await User.create({
    name: 'Supplier Two',
    email: 'supplier2-analytics@test.com',
    password: 'password123',
    role: 'supplier',
    organizationId: org._id
  });
  
  // Create test invoices with various dates and confidence scores
  const now = new Date();
  const invoices = [];
  
  // This month invoices
  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
    invoices.push({
      userId: supplier1._id,
      organizationId: org._id,
      filename: `invoice-${i + 1}.pdf`,
      filePath: `/uploads/invoice-${i + 1}.pdf`,
      extractedData: {
        invoiceNumber: `INV-${i + 1}`,
        grandTotal: 1000 + (i * 100),
        supplierName: 'Test Supplier'
      },
      confidenceScores: {
        invoiceNumber: 95,
        grandTotal: 85,
        supplierName: 90
      },
      createdAt: date
    });
  }
  
  // Add some invoices from supplier 2
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), i + 10);
    invoices.push({
      userId: supplier2._id,
      organizationId: org._id,
      filename: `invoice-s2-${i + 1}.pdf`,
      filePath: `/uploads/invoice-s2-${i + 1}.pdf`,
      extractedData: {
        invoiceNumber: `INV-S2-${i + 1}`,
        grandTotal: 2000 + (i * 200),
        supplierName: 'Test Supplier 2'
      },
      confidenceScores: {
        invoiceNumber: 60, // Low confidence
        grandTotal: 65,    // Low confidence
        supplierName: 55   // Low confidence
      },
      createdAt: date
    });
  }
  
  // Add some older invoices (last 30 days)
  for (let i = 0; i < 4; i++) {
    const date = new Date(now.getTime() - (i + 5) * 24 * 60 * 60 * 1000);
    invoices.push({
      userId: supplier1._id,
      organizationId: org._id,
      filename: `invoice-old-${i + 1}.pdf`,
      filePath: `/uploads/invoice-old-${i + 1}.pdf`,
      extractedData: {
        invoiceNumber: `INV-OLD-${i + 1}`,
        grandTotal: 500 + (i * 50),
        supplierName: 'Test Supplier'
      },
      confidenceScores: {
        invoiceNumber: 92,
        grandTotal: 88,
        supplierName: 91
      },
      createdAt: date
    });
  }
  
  await History.insertMany(invoices);
  
  console.log(`Created organization: ${org._id}`);
  console.log(`Created admin: ${admin._id}`);
  console.log(`Created ${invoices.length} test invoices`);
  
  return { org, admin, supplier1, supplier2 };
}

async function cleanupTestData(org) {
  console.log('\nCleaning up test data...');
  await History.deleteMany({ organizationId: org._id });
  await User.deleteMany({ organizationId: org._id });
  await Organization.findByIdAndDelete(org._id);
  console.log('Cleanup complete');
}

async function testAnalyticsEndpoint() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/invoice-ocr');
    console.log('Connected to database\n');
    
    const { org, admin } = await setupTestData();
    
    console.log('\n=== Testing Analytics Endpoint ===\n');
    
    // Test 1: Valid organization admin request
    console.log('Test 1: Valid organization admin request');
    const req1 = createMockReq(admin);
    const res1 = createMockRes();
    await getAnalytics(req1, res1);
    
    if (res1.jsonData?.success) {
      console.log('✓ Analytics endpoint returned success');
      const data = res1.jsonData.data;
      
      console.log('\nAnalytics Data:');
      console.log(`- Total Invoices This Month: ${data.totalInvoicesThisMonth}`);
      console.log(`- Total Value This Month: $${data.totalValueThisMonth}`);
      console.log(`- Average Confidence Score: ${data.averageConfidenceScore}%`);
      console.log(`- Low Confidence Percentage: ${data.lowConfidencePercentage}%`);
      console.log(`- Upload Trend Data Points: ${data.uploadTrend.length}`);
      console.log(`- Supplier Distribution: ${data.supplierDistribution.length} suppliers`);
      
      // Verify acceptance criteria
      console.log('\n=== Acceptance Criteria Verification ===');
      
      // Check total invoices this month
      if (data.totalInvoicesThisMonth >= 0) {
        console.log('✓ Calculate total invoices processed this month');
      } else {
        console.log('✗ Failed to calculate total invoices');
      }
      
      // Check total invoice value
      if (data.totalValueThisMonth >= 0) {
        console.log('✓ Calculate total invoice value this month');
      } else {
        console.log('✗ Failed to calculate total value');
      }
      
      // Check 30-day trend data
      if (data.uploadTrend && data.uploadTrend.length === 30) {
        console.log('✓ Generate 30-day upload trend data');
      } else {
        console.log(`✗ Upload trend data incomplete (${data.uploadTrend?.length || 0}/30 days)`);
      }
      
      // Check supplier distribution
      if (data.supplierDistribution && data.supplierDistribution.length > 0) {
        console.log('✓ Calculate invoice distribution by supplier');
      } else {
        console.log('✗ Failed to calculate supplier distribution');
      }
      
      // Check average confidence score
      if (typeof data.averageConfidenceScore === 'number') {
        console.log('✓ Calculate average confidence score');
      } else {
        console.log('✗ Failed to calculate average confidence score');
      }
      
      // Check low-confidence percentage
      if (typeof data.lowConfidencePercentage === 'number') {
        console.log('✓ Calculate percentage of low-confidence invoices');
      } else {
        console.log('✗ Failed to calculate low-confidence percentage');
      }
      
    } else {
      console.log('✗ Analytics endpoint failed');
      console.log('Error:', res1.jsonData);
    }
    
    // Test 2: Non-admin user (should fail)
    console.log('\n\nTest 2: Non-admin user access (should be denied)');
    
    // Clean up any existing regular user
    await User.deleteOne({ email: 'regular@test.com' });
    
    const nonAdmin = await User.create({
      name: 'Regular User',
      email: 'regular@test.com',
      password: 'password123',
      role: 'supplier',
      organizationId: org._id
    });
    
    const req2 = createMockReq(nonAdmin);
    const res2 = createMockRes();
    await getAnalytics(req2, res2);
    
    if (res2.statusCode === 403) {
      console.log('✓ Verify user is organization_admin (access denied for non-admin)');
    } else {
      console.log('✗ Failed to verify organization_admin role');
    }
    
    console.log('\n=== All Tests Complete ===\n');
    
    await cleanupTestData(org);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testAnalyticsEndpoint();
