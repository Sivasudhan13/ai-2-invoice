/**
 * Test script to verify login endpoint returns organization data
 * This simulates what the frontend will receive
 */

const testLoginResponse = async () => {
  try {
    console.log('🧪 Testing Login Endpoint Response Structure\n');

    // Test with an existing user
    const testEmail = 's@gmail.com';
    const testPassword = '123456'; // Update with actual password if different

    console.log(`📝 Attempting login with: ${testEmail}`);
    console.log('⚠️  Note: Update password in script if login fails\n');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    console.log('✅ Login successful!\n');
    console.log('📦 Response data structure:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 Checking required fields:');
    const userData = data.data;
    
    const checks = [
      { field: 'id', value: userData.id, required: true },
      { field: 'name', value: userData.name, required: true },
      { field: 'email', value: userData.email, required: true },
      { field: 'role', value: userData.role, required: true },
      { field: 'permissions', value: userData.permissions, required: true },
      { field: 'token', value: userData.token, required: true },
      { field: 'organizationId', value: userData.organizationId, required: false },
      { field: 'organizationName', value: userData.organizationName, required: false }
    ];

    checks.forEach(({ field, value, required }) => {
      const exists = value !== undefined && value !== null;
      const status = exists ? '✓' : (required ? '✗' : '○');
      const label = required ? 'REQUIRED' : 'OPTIONAL';
      console.log(`  ${status} ${field} (${label}):`, value || 'null');
    });

    console.log('\n✅ All required fields present!');
    
    if (userData.permissions) {
      console.log('\n🔐 Permissions object:');
      console.log(JSON.stringify(userData.permissions, null, 2));
    }

  } catch (error) {
    if (error.message.includes('fetch failed')) {
      console.error('❌ Cannot connect to server. Is the backend running on http://localhost:5000?');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

testLoginResponse();
