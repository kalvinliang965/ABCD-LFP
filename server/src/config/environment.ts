// src/config/environment.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// manually create __dirname (because ESM doesn't have it)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now use __dirname safely
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const dev = {
    is_dev: process.env.NODE_ENV === "development",
};