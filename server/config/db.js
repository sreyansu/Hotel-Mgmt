/**
 * ==============================================================================
 * DATABASE CONFIGURATION (Mongoose / MongoDB)
 * ==============================================================================
 * Establishes a persistent connection to the MongoDB database using Mongoose ODM.
 * Falls back to local URI (mongodb://127.0.0.1:27017/hotel_mgmt) if env is not set.
 */

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_mgmt';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Terminate server process if database connection fails
    process.exit(1);
  }
};
