// src/config/environment.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env_status = {
    is_dev: process.env.NODE_ENV === "development",
    is_test: process.env.NODE_ENV === 'test',
    is_prod: process.env.NODE_ENV === "production",
};