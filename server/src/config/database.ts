// src/config/database.ts
export const  database_config = {
    MONGO_URL: process.env.MONGO_URI || "mongodb://localhost:27017/mydb",
    MONGO_TEST_URL: process.env.MONGODB_TEST_URL || "mongodb://localhost:27017/db_test",
    DB_NAME: process.env.DB_NAME || "mydb",
}