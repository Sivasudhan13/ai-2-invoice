import { spawn } from 'child_process';
import { platform } from 'os';
import net from 'net';

console.log('🚀 Starting Invoice AI System...\n');

// Check if MongoDB is running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    const client = net.createConnection({ port: 27017, host: 'localhost' }, () => {
      client.end();
      resolve(true);
    });
    
    client.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      client.destroy();
      resolve(false);
    }, 2000);
  });
};

// Start MongoDB
const startMongoDB = () => {
  return new Promise((resolve) => {
    console.log('📦 Starting MongoDB...');
    
    const isWindows = platform() === 'win32';
    const mongoCmd = isWindows ? 'mongod' : 'mongod';
    const mongoArgs = ['--dbpath', isWindows ? 'C:\\data\\db' : '/data/db'];
    
    const mongod = spawn(mongoCmd, mongoArgs, {
      detached: true,
      stdio: 'ignore'
    });
    
    mongod.unref();
    
    // Wait for MongoDB to start
    setTimeout(() => {
      console.log('✅ MongoDB started\n');
      resolve();
    }, 3000);
  });
};

// Start Node server
const startNodeServer = () => {
  console.log('🚀 Starting Node.js server...\n');
  
  const node = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  node.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
  
  node.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
    process.exit(code);
  });
};

// Main function
const main = async () => {
  try {
    const mongoRunning = await checkMongoDB();
    
    if (!mongoRunning) {
      console.log('⚠️  MongoDB is not running');
      await startMongoDB();
      
      // Verify MongoDB started
      const mongoStarted = await checkMongoDB();
      if (!mongoStarted) {
        console.error('❌ Failed to start MongoDB');
        console.error('💡 Please start MongoDB manually:');
        console.error('   Windows: Run as Administrator → net start MongoDB');
        console.error('   Or: mongod --dbpath="C:\\data\\db"');
        console.error('   Mac/Linux: sudo systemctl start mongodb');
        process.exit(1);
      }
    } else {
      console.log('✅ MongoDB is already running\n');
    }
    
    startNodeServer();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
