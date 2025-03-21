import mongoose, {Connection} from "mongoose";
import { database_config } from "../config/database";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function tryConnect(retryCount = 0): Promise<Connection> {
  try {
    await mongoose.connect(database_config.MONGO_URL, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });
    
    console.log("Connected to database");
    const mongodb = mongoose.connection;
    console.log("Connected to database:", mongodb.name);
    
    if (!mongodb) {
      throw new Error("MongoDB connection not found");
    }

    // Set up error handler
    mongodb.on('error', (error) => {
      console.error("MongoDB connection error:", error);
    });

    // Set up reconnect handler
    mongodb.on('disconnected', () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
      setTimeout(() => tryConnect(), RETRY_DELAY);
    });

    return mongodb;
  } catch(error) {
    console.error("MongoDB connection error:", error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return tryConnect(retryCount + 1);
    }
    
    throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
  }
}

export const connect_database = async(): Promise<Connection> => {
  return tryConnect();
};

export const disconnect_database = async(): Promise<void> => {
  try {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Database disconnected");
  } catch (error) {
    console.error("Failed to disconnect from database:", error);
    throw error;
  }
};