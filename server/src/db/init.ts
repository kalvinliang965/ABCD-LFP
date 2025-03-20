import mongoose from "mongoose";
import { database_config } from "../config/database";


export const initDB = async(): Promise<void> => {
    try {
        await mongoose.connect(database_config.MONGO_URL);
        console.log("Connected to database");
        const mongodb = mongoose.connection;
        mongodb.on("disconnected", () => console.log("Disconnected from database"));
        mongodb.on("reconnected", () => console.log("Reconnected to database"));
    } catch(error) {
        console.log("MongoDB connections error: ", error);
    }
}