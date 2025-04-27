import { Router, Application } from "express";
import eventSeriesRoutes from "./eventSeriesRoutes";
import investmentRoutes from "./investmentRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import scenarioYAMLRoutes from "./scenarioYAMLRoutes";
import scenarioRoutes from "./scenarioRoutes";
import investmentTypeRoutes from "./InvestmentType.routes";
import simulationRoutes from "./simulationRoutes";
import taxRoutes from "./taxRoutes";

export function initialize_route(app: Application) {
  // Register routes
  const router = Router();
  router.use("/api/eventSeries", eventSeriesRoutes);
  router.use("/api/investments", investmentRoutes);
  router.use("/api/investmentTypes", investmentTypeRoutes);
  router.use("/api/users", userRoutes);
  router.use("/api/scenarios", scenarioRoutes);
  router.use("/api/yaml", scenarioYAMLRoutes);
  router.use("/api/tax", taxRoutes);
  router.use("/auth", authRoutes);
  router.use("/api/simulations", simulationRoutes);
  // Basic health check route
  router.get("/", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // 登录路由
  router.post("/api/login", (req, res) => {
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

  app.use(router);
}
