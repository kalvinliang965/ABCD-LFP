// src/config/environment.ts
import dotenv from "dotenv";
import path from "path";

// 配置dotenv指向服务器根目录的.env文件
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const dev = {
    is_dev: process.env.NODE_ENV === "development",
}
