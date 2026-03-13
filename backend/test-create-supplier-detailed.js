// Detailed test script for create supplier endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testCreateSupplier = async () => {
  console.log('=== CREATE SUPPLIER ENDPOINT TEST ===\n');

  try {
    // Step 1: Test if backend is running
    console.log('1. Testing if backend is running...');
    try {
      const healthCheck = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test', password: 'test' })
      });
      console.log('✓ Backend is running (status:', healthCheck.status, ')\n');
    } catch (err) {
      console.error('✗ Backend is NOT running!');
      console.error('Please start the backend server first: cd backend && npm start\n');
      return;
    }

    // Step 2: Login as organization admin
    console.log('2. Logging in as organization admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sivasudhan87@gmail.com', // Updated to actual org admin email
        password: 'password123'  // Replace with actual password if different
      })
    });

    console.log('   Status:', loginResponse.status);
    console.log('   Headers:', JSON.stringify(loginResponse.headers.raw(), null, 2));

    const loginText = await loginResponse.text();
    console.log('   Response body:', loginText);

    if (!loginResponse.ok) {
      console.error('\n✗ Login failed!');
      console.error('Please update the email/password in this test script to match your org admin account.\n');
      return;
    }

    const loginData = JSON.parse(loginText);
    if (!loginData.data?.token) {
      console.error('\n✗ No token in login response!');
      console.error('Response structure:', JSON.stringify(loginData, null, 2));
      return;
    }

    const token = loginData.data.token;
    console.log('✓ Login successful');
    console.log('   Token:', token.substring(0, 30) + '...\n');

    // Step 3: Test create supplier endpoint
    console.log('3. Creating supplier account...');
    const supplierEmail = `test-supplier-${Date.now()}@example.com`;
    const supplierData = {
      name: 'Test Supplier',
      email: supplierEmail,
      password: 'password123'
    };

    console.log('   Request URL:', `${BASE_URL}/api/organization/supplier`);
    console.log('   Request body:', JSON.stringify(supplierData, null, 2));
    console.log('   Authorization: Bearer', token.substring(0, 30) + '...');

    const createResponse = await fetch(`${BASE_URL}/api/organization/supplier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(supplierData)
    });

    console.log('\n   Response status:', createResponse.status);
    console.log('   Response headers:', JSON.stringify(createResponse.headers.raw(), null, 2));

    const responseText = await createResponse.text();
    console.log('   Response body (raw):', responseText);

    if (!responseText) {
      console.error('\n✗ EMPTY RESPONSE BODY!');
      console.error('This is the root cause of the JSON parse error.');
      console.error('Check backend logs for errors.\n');
      return;
    }

    try {
      const createData = JSON.parse(responseText);
      console.log('   Response body (parsed):', JSON.stringify(createData, null, 2));

      if (createResponse.ok) {
        console.log('\n✓ SUCCESS! Supplier created successfully!');
        console.log('   Supplier ID:', createData.data?.id);
        console.log('   Supplier name:', createData.data?.name);
        console.log('   Supplier email:', createData.data?.email);
      } else {
        console.error('\n✗ Request failed with error:', createData.error);
      }
    } catch (parseError) {
      console.error('\n✗ Failed to parse JSON response!');
      console.error('Parse error:', parseError.message);
      console.error('Raw response:', responseText);
    }

  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n=== TEST COMPLETE ===');
};

// Run the test
testCreateSupplier();
