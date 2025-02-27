const mongoose = require('mongoose');

// Connection options
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Track connection state
let isConnecting = false;
let connectionPromise = null;

/**
 * Connects to MongoDB with serverless optimizations
 */
const connectToDatabase = async () => {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  
  // Return existing connection attempt if in progress
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }
  
  // Start new connection
  isConnecting = true;
  
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      // Verify environment variables
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined');
      }
      
      // Connect with timeout
      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      
      // Setup connection event handlers for serverless environment
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // In serverless, we don't want to crash the function on connection errors
        // Just log them and let the next invocation try again
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        // Reset connection state for next serverless invocation
        isConnecting = false;
        connectionPromise = null;
      });
      
      resolve();
    } catch (error) {
      isConnecting = false;
      connectionPromise = null;
      
      console.error('MongoDB connection failed:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      reject(error);
    }
  });
  
  return connectionPromise;
};

module.exports = { connectToDatabase };