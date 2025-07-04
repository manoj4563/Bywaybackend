const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/byway', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;