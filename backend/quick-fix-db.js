import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔧 MongoDB Connection Quick Fix\n');
console.log('=' .repeat(50));

// Check 1: Environment variable
console.log('\n✓ Check 1: Environment Variable');
if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI not found in .env file');
  console.log('💡 Add this to your .env file:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
  process.exit(1);
}
console.log('✅ MONGODB_URI found');

// Check 2: URI format
console.log('\n✓ Check 2: URI Format');
const uri = process.env.MONGODB_URI;
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('   URI:', maskedUri);

if (!uri.includes('mongodb')) {
  console.log('❌ Invalid MongoDB URI format');
  process.exit(1);
}
console.log('✅ URI format looks correct');

// Check 3: Database name
console.log('\n✓ Check 3: Database Name');
const hasDbName = uri.includes('mongodb.net/') && uri.split('mongodb.net/')[1].split('?')[0].length > 0;
if (!hasDbName) {
  console.log('⚠️  No database name in URI');
  console.log('💡 Add database name: mongodb+srv://...mongodb.net/YOUR_DB_NAME?...');
} else {
  const dbName = uri.split('mongodb.net/')[1].split('?')[0];
  console.log(`✅ Database name: ${dbName}`);
}

// Check 4: Connection test
console.log('\n✓ Check 4: Connection Test');
console.log('⏳ Attempting to connect (30 second timeout)...\n');

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

let connected = false;

mongoose.connect(uri, options)
  .then(() => {
    connected = true;
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Your database connection is working!');
    console.log('✅ You can now start your server with: npm start');
    console.log('='.repeat(50) + '\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ FAILED! Could not connect to MongoDB\n');
    console.log('Error:', error.message);
    console.log('\n' + '='.repeat(50));
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('='.repeat(50));
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\n❌ DNS/Network Error');
      console.log('   Possible causes:');
      console.log('   • No internet connection');
      console.log('   • Invalid cluster hostname');
      console.log('   • VPN blocking connection');
      console.log('\n   Solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify cluster hostname in MongoDB Atlas');
      console.log('   3. Try disabling VPN');
    } 
    else if (error.message.includes('authentication failed') || error.message.includes('auth')) {
      console.log('\n❌ Authentication Error');
      console.log('   Your username or password is incorrect');
      console.log('\n   Solutions:');
      console.log('   1. Go to MongoDB Atlas → Database Access');
      console.log('   2. Verify username matches your URI');
      console.log('   3. Reset password if needed');
      console.log('   4. Update .env file with correct credentials');
    }
    else if (error.message.includes('timed out') || error.message.includes('timeout')) {
      console.log('\n❌ Connection Timeout');
      console.log('   Your IP address is likely not whitelisted');
      console.log('\n   Solutions (MOST IMPORTANT):');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Select your project and cluster');
      console.log('   3. Click "Network Access" in left sidebar');
      console.log('   4. Click "Add IP Address" button');
      console.log('   5. Click "Allow Access from Anywhere"');
      console.log('   6. Enter: 0.0.0.0/0');
      console.log('   7. Click "Confirm"');
      console.log('   8. WAIT 2-3 MINUTES for changes to apply');
      console.log('   9. Run this script again');
    }
    else if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('alert')) {
      console.log('\n❌ SSL/TLS Error');
      console.log('   This is usually caused by IP not being whitelisted');
      console.log('\n   Solutions:');
      console.log('   1. Whitelist your IP in MongoDB Atlas (see steps above)');
      console.log('   2. Wait 2-3 minutes after whitelisting');
      console.log('   3. Try a different network (mobile hotspot)');
      console.log('   4. Check if firewall is blocking port 27017');
    }
    else {
      console.log('\n❌ Unknown Error');
      console.log('   Check MongoDB Atlas status: https://status.mongodb.com');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📝 ALTERNATIVE: Use Local MongoDB');
    console.log('='.repeat(50));
    console.log('\nIf MongoDB Atlas continues to fail:');
    console.log('1. Install MongoDB locally:');
    console.log('   • Windows: https://www.mongodb.com/try/download/community');
    console.log('   • Mac: brew install mongodb-community');
    console.log('   • Linux: sudo apt-get install mongodb');
    console.log('\n2. Start MongoDB: mongod');
    console.log('\n3. Update .env file:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/invoiceDB');
    console.log('\n4. Restart your server');
    console.log('\n' + '='.repeat(50) + '\n');
    
    process.exit(1);
  });

// Timeout handler
setTimeout(() => {
  if (!connected) {
    console.log('\n⏰ Connection attempt timed out after 30 seconds');
    console.log('💡 This usually means your IP is not whitelisted in MongoDB Atlas');
    process.exit(1);
  }
}, 31000);
