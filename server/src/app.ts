import express from "express";
import "./config/environment"; // load environment variables
import { registerGlobalMiddleWare, sessionStore } from "./middleware";
import { connect_database, disconnect_database } from "./db/connections";
import { api_config } from "./config/api";
import eventSeriesRoutes from "./routes/eventSeriesRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import { scrapping_demo, testProcessRMD } from "./demo";

import passport from "passport";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import "./auth/passport"; // Import passport configuration
import investmentTypeRoutes from "./routes/InvestmentType.routes";
import session from 'express-session';
const port = api_config.PORT;
const app = express();

// Register middleware
registerGlobalMiddleWare(app);

// Add session middleware before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Register routes
app.use("/api/eventSeries", eventSeriesRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/investmentTypes", investmentTypeRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);

// Add a specific route for YAML files
app.post('/api/yaml', async (req, res) => {
  try {
    const { name, content } = req.body;
    // @ts-ignore
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    const User = require('./db/models/User').default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Add the new YAML file
    user.yamlFiles.push({ name, content, createdAt: new Date() });
    await user.save();
    
    // Return the newly added YAML file
    const newFile = user.yamlFiles[user.yamlFiles.length - 1];
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error adding YAML file:', error);
    res.status(500).json({ success: false, message: "Error adding YAML file" });
  }
});

//this part is for the login, check it after finishing other backend
// Initialize Passport (add this after registerGlobalMiddleWare)
// app.use(passport.initialize());
// app.use(passport.session());

// Add user routes
// app.use(userRoutes);

// Google OAuth routes
// app.get("/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get("/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Successful authentication, redirect to dashboard
//     res.redirect("/dashboard");
//   }
// );

// Logout route - commented out until passport is properly set up
// app.get("/api/logout", (req, res) => {
//   if (req.logout) {
//     req.logout((err) => {
//       if (err) {
//         console.error("Error during logout:", err);
//         return res.status(500).json({ error: "Logout failed" });
//       }
//       res.redirect("/");
//     });
//   } else {
//     res.redirect("/");
//   }
// });

// Basic health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
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

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//KEEP FOR KATE THIS
// Connect to database and handle shutdown
connect_database().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});


// Graceful shutdown
async function terminate() {
  try {
    console.log("Terminating server...");

    // // sessionStore
    // if (sessionStore) {
    //     console.log("Closing session store...");
    //     sessionStore.close();
    // }

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

process.on("SIGINT", terminate);
process.on("SIGTERM", terminate);


// // Add this near the end of your file, before scrapping_demo()
// function testRMDScraper() {
//   console.log("\n--- Testing RMD Scraper ---");
//   const { getRMDFactors } = require("./services/RMDScraper");
//   console.log(`RMD Factor for age 72: ${getRMDFactors(72)}`);
//   console.log(`RMD Factor for age 75: ${getRMDFactors(75)}`);
//   console.log(`RMD Factor for age 85: ${getRMDFactors(85)}`);
//   console.log("--- End RMD Scraper Test ---\n");
// }

// // Call this function before or after scrapping_demo()
// testRMDScraper();

scrapping_demo();
//testProcessRMD();
//scrapping_demo();
