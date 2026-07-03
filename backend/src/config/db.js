const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edugen');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed (it will retry or endpoints won't work): ${error.message}`);
    // Removed process.exit(1) to allow backend to boot even if DB isn't running locally yet
  }
};

module.exports = { connectDB };
