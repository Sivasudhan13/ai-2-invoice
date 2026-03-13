import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import invoiceRoutes from './routes/invoice.routes.js';
import authRoutes from './routes/auth.routes.js';
import historyRoutes from './routes/history.routes.js';
import organizationRoutes from './routes/organization.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL // For production frontend URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    // In production, allow all origins if FRONTEND_URL is not set
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/invoice', invoiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/organization', organizationRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'Invoice OCR API is running',
    database: dbStatus
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Database Connection with proper configuration
const connectDB = async () => {
  try {
    // Simplified options for local MongoDB
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('⏳ Connecting to MongoDB...');
    console.log('📍 URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('📦 Connected to MongoDB');
    console.log('✅ Database:', mongoose.connection.db.databaseName);
    console.log('✅ Database ready');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Troubleshooting steps:');
    console.error('   1. Check if MongoDB is running: mongosh');
    console.error('   2. Check MONGODB_URI in .env file');
    console.error('   3. For local MongoDB, use: mongodb://localhost:27017/invoiceDB');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed through app termination');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
  process.exit(0);
});

// Start server only after database connection
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Server not started.');
    console.error('💡 Please fix the database connection and try again.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`✅ Server is ready to accept requests`);
  });
};

// Start the server
startServer();
