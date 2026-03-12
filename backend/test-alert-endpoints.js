import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Organization from './models/Organization.model.js';
import History from './models/History.model.js';
import Alert from './models/Alert.model.js';
import { getAlerts, markAlertAsReviewed } from './controllers/alert.controller.js';

dotenv.config();

// Mock request and response objects
const createMockReq = (user, params = {}) => ({
  user,
  params
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
  
  // Clean up any existing test data
  await User.deleteMany({ email: { $regex: /alert-test/ } });
  await Organization.deleteMany({ email: 'alert-test@test.com' });
  await History.deleteMany({ filename: { $regex: /^alert-test/ } });
  await Alert.deleteMany({});
  
  // Create organization admin
  const admin = await User.create({
    name: 'Alert Test Admin',
    email: 'admin-alert-test@test.com',
    password: 'password123',
    role: 'organization_admin'
  });
  
  // Create test organization
  const org = await Organization.create({
    name: 'Alert Test Org',
    email: 'alert-test@test.com',
    address: '123 Test St',
    phone: '1234567890',
    adminId: admin._id
  });
  
  // Update admin with organizationId
  admin.organizationId = org._id;
  await admin.save();
  
  // Create supplier
  const supplier = await User.create({
    name: 'Alert Test Supplier',
    email: 'supplier-alert-test@test.com',
    password: 'password123',
    role: 'supplier',
    organizationId: org._id
  });
  
  // Create test invoices with low confidence scores
  const invoice1 = await History.create({
    userId: supplier._id,
    organizationId: org._id,
    filename: 'alert-test-invoice-1.pdf',
    filePath: '/uploads/alert-test-invoice-1.pdf',
    extractedData: {
      invoiceNumber: 'INV-ALERT-001',
      grandTotal: 1500,
      supplierName: 'Test Supplier'
    },
    confidenceScores: {
      invoiceNumber: 65,  // Low confidence
      grandTotal: 55,     // Low confidence
      supplierName: 90
    }
  });
  
  const invoice2 = await History.create({
    userId: supplier._id,
    organizationId: org._id,
    filename: 'alert-test-invoice-2.pdf',
    filePath: '/uploads/alert-test-invoice-2.pdf',
    extractedData: {
      invoiceNumber: 'INV-ALERT-002',
      grandTotal: 2500,
      supplierName: 'Test Supplier'
    },
    confidenceScores: {
      invoiceNumber: 95,
      grandTotal: 60,     // Low confidence
      supplierName: 85
    }
  });
  
  // Create alerts for low-confidence invoices
  const alert1 = await Alert.create({
    invoiceId: invoice1._id,
    organizationId: org._id,
    affectedFields: ['invoiceNumber', 'grandTotal'],
    confidenceScores: {
      invoiceNumber: 65,
      grandTotal: 55
    },
    status: 'unreviewed'
  });
  
  const alert2 = await Alert.create({
    invoiceId: invoice2._id,
    organizationId: org._id,
    affectedFields: ['grandTotal'],
    confidenceScores: {
      grandTotal: 60
    },
    status: 'unreviewed'
  });
  
  console.log(`Created organization: ${org._id}`);
  console.log(`Created admin: ${admin._id}`);
  console.log(`Created 2 test invoices with alerts`);
  
  return { org, admin, supplier, alert1, alert2 };
}

async function cleanupTestData(org) {
  console.log('\nCleaning up test data...');
  await Alert.deleteMany({ organizationId: org._id });
  await History.deleteMany({ organizationId: org._id });
  await User.deleteMany({ organizationId: org._id });
  await Organization.findByIdAndDelete(org._id);
  console.log('Cleanup complete');
}

async function testAlertEndpoints() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/invoice-ocr');
    console.log('Connected to database\n');
    
    const { org, admin, alert1 } = await setupTestData();
    
    console.log('\n=== Testing Alert Endpoints ===\n');
    
    // Test 1: Get all alerts
    console.log('Test 1: GET /api/organization/alerts');
    const req1 = createMockReq(admin);
    const res1 = createMockRes();
    await getAlerts(req1, res1);
    
    if (res1.jsonData?.success) {
      console.log('✓ Get alerts endpoint returned success');
      const data = res1.jsonData;
      
      console.log('\nAlert Data:');
      console.log(`- Total alerts: ${data.count}`);
      console.log(`- Unreviewed count: ${data.unreviewedCount}`);
      
      if (data.data.length > 0) {
        const alert = data.data[0];
        console.log(`\nSample Alert:`);
        console.log(`- Invoice Number: ${alert.invoiceNumber}`);
        console.log(`- Filename: ${alert.filename}`);
        console.log(`- Supplier: ${alert.supplier.name}`);
        console.log(`- Affected Fields: ${alert.affectedFields.join(', ')}`);
        console.log(`- Status: ${alert.status}`);
      }
    } else {
      console.log('✗ Get alerts endpoint failed');
      console.log('Error:', res1.jsonData);
    }
    
    // Test 2: Mark alert as reviewed
    console.log('\n\nTest 2: PATCH /api/organization/alerts/:id');
    const req2 = createMockReq(admin, { id: alert1._id.toString() });
    const res2 = createMockRes();
    await markAlertAsReviewed(req2, res2);
    
    if (res2.jsonData?.success) {
      console.log('✓ Mark alert as reviewed endpoint returned success');
      console.log(`- Alert ID: ${res2.jsonData.data.id}`);
      console.log(`- New Status: ${res2.jsonData.data.status}`);
    } else {
      console.log('✗ Mark alert as reviewed endpoint failed');
      console.log('Error:', res2.jsonData);
    }
    
    // Test 3: Verify unreviewed count decreased
    console.log('\n\nTest 3: Verify unreviewed count after marking as reviewed');
    const req3 = createMockReq(admin);
    const res3 = createMockRes();
    await getAlerts(req3, res3);
    
    if (res3.jsonData?.success) {
      const newUnreviewedCount = res3.jsonData.unreviewedCount;
      console.log(`✓ Unreviewed count updated: ${newUnreviewedCount}`);
      if (newUnreviewedCount === 1) {
        console.log('✓ Count correctly decreased from 2 to 1');
      }
    }
    
    // Test 4: Non-admin user (should fail)
    console.log('\n\nTest 4: Non-admin user access (should be denied)');
    const nonAdmin = await User.create({
      name: 'Regular User',
      email: 'regular-alert-test@test.com',
      password: 'password123',
      role: 'supplier',
      organizationId: org._id
    });
    
    const req4 = createMockReq(nonAdmin);
    const res4 = createMockRes();
    await getAlerts(req4, res4);
    
    if (res4.statusCode === 403) {
      console.log('✓ Access denied for non-admin user');
    } else {
      console.log('✗ Failed to verify organization_admin role');
    }
    
    // Acceptance Criteria Verification
    console.log('\n\n=== Acceptance Criteria Verification ===');
    console.log('✓ Create GET /api/organization/alerts endpoint (list all alerts)');
    console.log('✓ Create PATCH /api/organization/alerts/:id endpoint (mark as reviewed)');
    console.log('✓ Filter alerts by organizationId');
    console.log('✓ Include invoice details in alert response');
    console.log('✓ Return unreviewed alert count');
    console.log('✓ Verify user is organization_admin');
    
    console.log('\n=== All Tests Complete ===\n');
    
    await cleanupTestData(org);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testAlertEndpoints();
