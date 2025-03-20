import express from "express";
import "./config/environment"; // load environment vairable
import { registerGlobalMiddleWare, sessionStore } from "./middleware";
import { connect_database, disconnect_database } from "./db/connections";
import { api_config } from "./config/api";

const port = api_config.PORT;
const app = express();

registerGlobalMiddleWare(app);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// 登录路由
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("收到登录请求:", { username, password }); // 添加日志

  // 这里暂时跳过验证逻辑
  // 直接返回成功响应
  res.json({
    success: true,
    message: "登录成功",
    redirectUrl: "/dashboard", // 前端将使用这个URL进行重定向
  });
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function terminate() {

    try {
        console.log("Terminating server...");

        // sessionStore
        if (sessionStore) {
            console.log("Closing session store...");
            sessionStore.close();
        }
        
        await disconnect_database();
        console.log("Server terminated successfully");
        // exit process if not in test environment
        if (process.env.NODE_ENV !== "test") {
            process.exit(0); // exit gracefully
        }

        await new Promise((resolve) => server.close(resolve));
    } catch (error) {
        console.log("Error during termiantion: ", error);
        process.exit(1); // exit with error
    }
}

const mongodb = connect_database();
process.on("SIGINT", terminate);
process.on("SIGTERM", terminate);


export {app, sessionStore, mongodb};

