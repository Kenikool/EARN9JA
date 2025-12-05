import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { emailService } from './services/EmailService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Earn9ja Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    api: 'Earn9ja API',
    version: '1.0.0',
    status: 'active',
    features: {
      authentication: 'available',
      tasks: 'available',
      payments: 'available',
      notifications: 'available'
    }
  });
});

// Test email endpoint
app.post('/api/v1/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const success = await emailService.sendOTP(email, '123456');
    
    if (success) {
      res.json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  MongoDB URI not configured');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Earn9ja Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  
  // Connect to database
  await connectDB();
  
  console.log('✅ Server startup complete!');
});

export default app;
