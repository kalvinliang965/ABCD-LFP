// src/config/database.ts
export const  database_config = {
    MONGO_URL: process.env.MONGO_URI || "mongodb://localhost:27017/mydb",
    DB_NAME: process.env.DB_NAME || "mydb",
}