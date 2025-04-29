// src/config/environment.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const dev = {
    is_dev: process.env.NODE_ENV === "development",
};