import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/login_db";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not set in the environment. Falling back to local MongoDB at mongodb://127.0.0.1:27017/login_db"
    );
  }

  await mongoose.connect(MONGODB_URI);
};

export default connectDB;
