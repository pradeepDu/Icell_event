const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database
 * Enhanced with better error handling and logging
 */
const connectToDatabase = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return;
    }
    
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not defined');
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in newer mongoose versions, but keeping them for compatibility
      // If you're using Mongoose 6+, these are automatically set to true
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // Handle specific MongoDB connection errors
    if (error.name === 'MongoNetworkError') {
      console.error('Network error connecting to MongoDB. Check your connection and MongoDB URI.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not select MongoDB server. The server may be down or the URI may be incorrect.');
    }
    
    throw error; // Re-throw to be caught by the route handler
  }
};

module.exports = { connectToDatabase };