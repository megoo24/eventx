import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async () => {
  try {
    const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventx";
    const conn = await mongoose.connect(primaryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Fallback to local Mongo if Atlas/SRV fails
    try {
      if (process.env.MONGO_URI && process.env.MONGO_URI.includes("mongodb+srv")) {
        const fallbackUri = "mongodb://127.0.0.1:27017/eventx";
        const conn = await mongoose.connect(fallbackUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`MongoDB Fallback Connected: ${conn.connection.host}`);
      }
    } catch (fallbackErr) {
      console.error("MongoDB fallback connection error:", fallbackErr);
    }
    // Do not exit; allow API to run and UI to load.
  }
};

export default connectDB;
