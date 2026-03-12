import mongoose from 'mongoose';
import { registerUser } from './controllers/authController.js';

const req = {
  body: {
    email: 'test-local@test.com',
    password: 'password',
    role: 'personal'
  }
};

const res = {
  status: (code) => {
    console.log('Status:', code);
    return res;
  },
  json: (data) => {
    console.log('JSON:', data);
    return res;
  }
};

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-ocr');
    console.log('Connected to DB');
    await registerUser(req, res);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Test script error:', err);
  }
}

run();
