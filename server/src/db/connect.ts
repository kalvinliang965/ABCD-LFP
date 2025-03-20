import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose
 * @returns Promise that resolves when connection is established
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
