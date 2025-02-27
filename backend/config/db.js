const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    
    const connection = await mongoose.connect(process.env.MONGO_URI, {
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
    throw err;
  }
}

module.exports = { connectToDatabase };