import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./db/connect";
import investmentTypeRouter from "./routes/InvestmentType.routes";

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); // 允许跨域请求

// Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Investment Type routes
app.use("/api/investments", investmentTypeRouter);

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;


