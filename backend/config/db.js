const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error("MongoDB connection URI is not defined in environment variables");
    }
    
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log("MongoDB Connected Successfully");
    cachedConnection = connection;
    return connection;
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    console.error("Connection Details:", {
      uri: process.env.MONGO_URI ? "URI is defined" : "URI is missing",
      mongooseVersion: mongoose.version
    });
    
    // Don't rethrow in production serverless environment
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    } else {
      // Log but don't crash the serverless function
      console.error("Continuing without database connection");
      return null;
    }
  }
}

module.exports = { connectToDatabase };