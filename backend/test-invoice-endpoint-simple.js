/**
 * Simple test script for the organization invoice history endpoint
 * 
 * Prerequisites:
 * 1. Backend server must be running on port 5000
 * 2. You need valid organization admin credentials
 * 3. The organization should have some invoices uploaded
 * 
 * Usage:
 * node test-invoice-endpoint-simple.js <admin-email> <admin-password>
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testInvoiceEndpoint() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.error('Usage: node test-invoice-endpoint-simple.js <admin-email> <admin-password>');
    process.exit(1);
  }
  
  try {
    // Step 1: Login
    console.log('1. Logging in as organization admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✓ Logged in as: ${user.name} (${user.role})`);
    
    if (user.role !== 'organization_admin') {
      console.error('✗ User is not an organization admin');
      process.exit(1);
    }
    
    // Step 2: Test GET /api/organization/invoices
    console.log('\n2. Testing GET /api/organization/invoices...');
    const invoicesResponse = await axios.get(`${BASE_URL}/organization/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✓ Success! Retrieved ${invoicesResponse.data.count} invoices`);
    
    if (invoicesResponse.data.count > 0) {
      const invoice = invoicesResponse.data.data[0];
      console.log('\nSample invoice:');
      console.log('  Invoice Number:', invoice.invoiceNumber);
      console.log('  Supplier:', invoice.supplier.name);
      console.log('  Upload Date:', new Date(invoice.uploadDate).toLocaleString());
      console.log('  Grand Total:', invoice.grandTotal);
      console.log('  Has Confidence Scores:', Object.keys(invoice.confidenceScores || {}).length > 0);
      
      // Step 3: Test filtering by supplier
      console.log('\n3. Testing filter by supplier...');
      const filterResponse = await axios.get(`${BASE_URL}/organization/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { supplierId: invoice.supplier.id }
      });
      console.log(`✓ Filtered results: ${filterResponse.data.count} invoices from ${invoice.supplier.name}`);
      
      // Step 4: Test date range filtering
      console.log('\n4. Testing date range filter...');
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const dateFilterResponse = await axios.get(`${BASE_URL}/organization/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: thirtyDaysAgo, endDate: today }
      });
      console.log(`✓ Date range results: ${dateFilterResponse.data.count} invoices in last 30 days`);
    }
    
    console.log('\n✓ All tests passed!');
    
  } catch (error) {
    console.error('\n✗ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testInvoiceEndpoint();
