import mongoose, {Connection} from "mongoose";
import { database_config } from "../config/database";


export const connect_database = async(): Promise<Connection> => {
    try {
        await mongoose.connect(database_config.MONGO_URL, {
            dbName: database_config.DB_NAME,
        });
        console.log("Connected to database");
        const mongodb = mongoose.connection;
        if (!mongodb) {
            throw new Error("mongodb connection not found");
        }
        return mongodb;
    } catch(error) {
        console.error("MongoDB connections error: ", error);
        throw error;
    }
}

export const disconnect_database = async(): Promise<void> => {
    try {
        console.log("Disconnecting from database....");
        await mongoose.disconnect();
        console.log("Database disconnected");
    } catch (error) {
        console.error("Fail to disconnect from database: ", error)
    }
}