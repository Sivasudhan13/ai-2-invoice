import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('✅ MONGODB_URI found in environment');
console.log('📍 URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
};

console.log('\n⏳ Attempting to connect...\n');

mongoose.connect(process.env.MONGODB_URI, options)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    console.log('✨ Connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful!');
    console.log('\n🎉 Database connection is working perfectly!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check your MongoDB URI hostname');
      console.error('   - Verify your internet connection');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Check your MongoDB username and password');
      console.error('   - Verify database user permissions');
    } else if (error.message.includes('timed out')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Your IP address may not be whitelisted in MongoDB Atlas');
      console.error('   - Check MongoDB Atlas Network Access settings');
      console.error('   - Add 0.0.0.0/0 to allow all IPs (for testing)');
    }
    
    console.error('\n📝 Steps to fix:');
    console.error('   1. Go to MongoDB Atlas (cloud.mongodb.com)');
    console.error('   2. Select your cluster');
    console.error('   3. Click "Network Access" in the left sidebar');
    console.error('   4. Click "Add IP Address"');
    console.error('   5. Click "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('   6. Save and wait 1-2 minutes');
    console.error('   7. Try again\n');
    
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected event fired');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error event:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected event fired');
});
