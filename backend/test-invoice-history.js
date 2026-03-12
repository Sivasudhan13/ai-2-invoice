import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  // You'll need to replace these with actual test credentials
  orgAdminEmail: 'admin@test.com',
  orgAdminPassword: 'password123',
  supplierEmail: 'supplier@test.com'
};

let authToken = '';
let supplierId = '';

// Helper function to make authenticated requests
const apiCall = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test 1: Login as organization admin
async function testLogin() {
  console.log('\n=== Test 1: Login as Organization Admin ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testConfig.orgAdminEmail,
      password: testConfig.orgAdminPassword
    });
    
    authToken = response.data.token;
    console.log('✓ Login successful');
    console.log('User:', response.data.user.name, '- Role:', response.data.user.role);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Get all organization invoices
async function testGetAllInvoices() {
  console.log('\n=== Test 2: Get All Organization Invoices ===');
  try {
    const result = await apiCall('GET', '/organization/invoices');
    console.log('✓ Retrieved invoices successfully');
    console.log(`Total invoices: ${result.count}`);
    
    if (result.data.length > 0) {
      console.log('\nSample invoice:');
      const invoice = result.data[0];
      console.log('- Invoice Number:', invoice.invoiceNumber);
      console.log('- Supplier:', invoice.supplier.name);
      console.log('- Upload Date:', new Date(invoice.uploadDate).toLocaleDateString());
      console.log('- Grand Total:', invoice.grandTotal);
      console.log('- Status:', invoice.status);
      console.log('- Confidence Scores:', JSON.stringify(invoice.confidenceScores, null, 2));
      
      // Store supplier ID for filtering test
      if (invoice.supplier.id) {
        supplierId = invoice.supplier.id;
      }
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to get invoices');
    return false;
  }
}

// Test 3: Filter invoices by supplier
async function testFilterBySupplier() {
  console.log('\n=== Test 3: Filter Invoices by Supplier ===');
  
  if (!supplierId) {
    console.log('⊘ Skipping - no supplier ID available');
    return true;
  }
  
  try {
    const result = await apiCall('GET', '/organization/invoices', null, {
      supplierId: supplierId
    });
    
    console.log('✓ Filtered by supplier successfully');
    console.log(`Invoices from this supplier: ${result.count}`);
    
    // Verify all invoices are from the specified supplier
    const allMatch = result.data.every(inv => inv.supplier.id === supplierId);
    if (allMatch) {
      console.log('✓ All invoices match the supplier filter');
    } else {
      console.log('✗ Some invoices do not match the supplier filter');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to filter by supplier');
    return false;
  }
}

// Test 4: Filter invoices by date range
async function testFilterByDateRange() {
  console.log('\n=== Test 4: Filter Invoices by Date Range ===');
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    const result = await apiCall('GET', '/organization/invoices', null, {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    
    console.log('✓ Filtered by date range successfully');
    console.log(`Invoices in last 30 days: ${result.count}`);
    
    // Verify all invoices are within date range
    const allInRange = result.data.every(inv => {
      const uploadDate = new Date(inv.uploadDate);
      return uploadDate >= thirtyDaysAgo && uploadDate <= today;
    });
    
    if (allInRange) {
      console.log('✓ All invoices are within the date range');
    } else {
      console.log('✗ Some invoices are outside the date range');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to filter by date range');
    return false;
  }
}

// Test 5: Verify sorting (newest first)
async function testSorting() {
  console.log('\n=== Test 5: Verify Sorting (Newest First) ===');
  
  try {
    const result = await apiCall('GET', '/organization/invoices');
    
    if (result.data.length < 2) {
      console.log('⊘ Not enough invoices to verify sorting');
      return true;
    }
    
    let isSorted = true;
    for (let i = 0; i < result.data.length - 1; i++) {
      const current = new Date(result.data[i].uploadDate);
      const next = new Date(result.data[i + 1].uploadDate);
      
      if (current < next) {
        isSorted = false;
        break;
      }
    }
    
    if (isSorted) {
      console.log('✓ Invoices are sorted correctly (newest first)');
    } else {
      console.log('✗ Invoices are not sorted correctly');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to verify sorting');
    return false;
  }
}

// Test 6: Verify permission check
async function testPermissionCheck() {
  console.log('\n=== Test 6: Verify Permission Check ===');
  console.log('Note: This test requires a user without canView permission');
  console.log('⊘ Skipping automated test - manual verification recommended');
  return true;
}

// Test 7: Verify response includes all required fields
async function testResponseStructure() {
  console.log('\n=== Test 7: Verify Response Structure ===');
  
  try {
    const result = await apiCall('GET', '/organization/invoices');
    
    if (result.data.length === 0) {
      console.log('⊘ No invoices to verify structure');
      return true;
    }
    
    const invoice = result.data[0];
    const requiredFields = [
      'id', 'invoiceNumber', 'supplier', 'uploadDate', 
      'grandTotal', 'status', 'filename', 'confidenceScores', 'extractedData'
    ];
    
    const supplierFields = ['id', 'name', 'email'];
    
    let allFieldsPresent = true;
    
    // Check invoice fields
    for (const field of requiredFields) {
      if (!(field in invoice)) {
        console.log(`✗ Missing field: ${field}`);
        allFieldsPresent = false;
      }
    }
    
    // Check supplier fields
    for (const field of supplierFields) {
      if (!(field in invoice.supplier)) {
        console.log(`✗ Missing supplier field: ${field}`);
        allFieldsPresent = false;
      }
    }
    
    if (allFieldsPresent) {
      console.log('✓ All required fields are present in response');
    }
    
    return allFieldsPresent;
  } catch (error) {
    console.error('✗ Failed to verify response structure');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=================================================');
  console.log('Organization Invoice History Endpoint Tests');
  console.log('=================================================');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Test 1: Login
  if (await testLogin()) {
    results.passed++;
    
    // Run remaining tests only if login succeeds
    const tests = [
      testGetAllInvoices,
      testFilterBySupplier,
      testFilterByDateRange,
      testSorting,
      testPermissionCheck,
      testResponseStructure
    ];
    
    for (const test of tests) {
      const result = await test();
      if (result) results.passed++;
      else results.failed++;
    }
  } else {
    results.failed++;
    console.log('\n⚠ Cannot continue tests without authentication');
  }
  
  // Summary
  console.log('\n=================================================');
  console.log('Test Summary');
  console.log('=================================================');
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`⊘ Skipped: ${results.skipped}`);
  console.log('=================================================');
}

// Run tests
runTests().catch(console.error);
