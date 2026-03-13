import http from 'http';

console.log('🔍 Testing Backend Server Connection...\n');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${description}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 100)}...\n`);
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`❌ ${description}`);
      console.log(`   Error: Request timeout\n`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

const testServer = async () => {
  console.log('Testing backend server at http://localhost:5000\n');
  console.log('='.repeat(50) + '\n');

  const healthCheck = await testEndpoint('/health', 'Health Check Endpoint');
  
  if (!healthCheck) {
    console.log('='.repeat(50));
    console.log('❌ BACKEND SERVER IS NOT RUNNING!\n');
    console.log('Please start the backend server:');
    console.log('   1. Open a terminal');
    console.log('   2. cd backend');
    console.log('   3. npm start\n');
    console.log('Or run: start-all.bat (as Administrator)\n');
    console.log('='.repeat(50));
    process.exit(1);
  }

  console.log('='.repeat(50));
  console.log('✅ Backend server is running correctly!');
  console.log('='.repeat(50));
  process.exit(0);
};

testServer();
