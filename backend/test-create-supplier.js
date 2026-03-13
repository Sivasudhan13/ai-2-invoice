// Quick test script for create supplier endpoint
import fetch from 'node-fetch';

const testCreateSupplier = async () => {
  try {
    // First login as organization admin
    console.log('1. Logging in as organization admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sivasudhan87@gmail.com', // Updated to actual org admin email
        password: 'password123'  // Replace with actual password if different
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.data?.token) {
      console.error('Login failed - no token received');
      return;
    }

    const token = loginData.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');

    // Now create supplier
    console.log('\n2. Creating supplier...');
    const createResponse = await fetch('http://localhost:5000/api/organization/supplier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Supplier',
        email: 'testsupplier@example.com',
        password: 'password123'
      })
    });

    console.log('Response status:', createResponse.status);
    console.log('Response headers:', createResponse.headers.raw());

    const responseText = await createResponse.text();
    console.log('Response body (raw):', responseText);

    if (responseText) {
      try {
        const createData = JSON.parse(responseText);
        console.log('Parsed response:', createData);
      } catch (e) {
        console.error('Failed to parse JSON:', e.message);
      }
    } else {
      console.error('Empty response body!');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
};

testCreateSupplier();
