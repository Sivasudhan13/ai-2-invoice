import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test the authorization middleware by making requests to protected routes

const API_URL = 'http://localhost:5000/api';

// Helper function to create a JWT token for testing
function createTestToken(userId, role, permissions) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Test 1: Access organization route without token (should return 401)
async function testNoToken() {
  console.log('\n=== Test 1: Access without token ===');
  try {
    const response = await fetch(`${API_URL}/organization/users`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log('Expected: 401 Unauthorized');
    console.log('Result:', response.status === 401 ? '✓ PASS' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 2: Access organization admin route with non-admin role (should return 403)
async function testWrongRole() {
  console.log('\n=== Test 2: Access admin route with wrong role ===');
  // This would require creating a test user with supplier role
  // For now, we'll document the expected behavior
  console.log('Expected: 403 Access denied when non-admin tries to access admin routes');
  console.log('Note: Requires actual user creation to test fully');
}

// Test 3: Access route without required permission (should return 403)
async function testMissingPermission() {
  console.log('\n=== Test 3: Access route without required permission ===');
  console.log('Expected: 403 Access denied when user lacks canView permission');
  console.log('Note: Requires actual user creation to test fully');
}

// Test 4: Verify middleware exports
async function testMiddlewareExports() {
  console.log('\n=== Test 4: Verify middleware exports ===');
  try {
    const authModule = await import('./middleware/auth.js');
    console.log('Exported functions:', Object.keys(authModule));
    const hasProtect = typeof authModule.protect === 'function';
    const hasRequireRole = typeof authModule.requireRole === 'function';
    const hasRequirePermission = typeof authModule.requirePermission === 'function';
    
    console.log('protect:', hasProtect ? '✓' : '✗');
    console.log('requireRole:', hasRequireRole ? '✓' : '✗');
    console.log('requirePermission:', hasRequirePermission ? '✓' : '✗');
    console.log('Result:', (hasProtect && hasRequireRole && hasRequirePermission) ? '✓ PASS' : '✗ FAIL');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('=================================');
  console.log('Authorization Middleware Tests');
  console.log('=================================');
  
  await testMiddlewareExports();
  await testNoToken();
  await testWrongRole();
  await testMissingPermission();
  
  console.log('\n=================================');
  console.log('Tests completed');
  console.log('=================================\n');
}

runTests();
