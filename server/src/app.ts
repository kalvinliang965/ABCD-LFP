import express from "express";
import "./config/environment"; // load environment variables
//import "./auth/passport";
import { initialize_middlewares, sessionStore } from "./middleware";
import { connect_database, disconnect_database } from "./db/connections";
import { api_config } from "./config/api";
import { simulation_engine_demo } from "./demos/demo";
import { Server } from "http";
import { initialize_route as initialize_routes } from "./routes";


// Graceful shutdown
async function initialize_graceful_shutdown(
  server: Server,
) {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

    signals.forEach(signal => {
      process.on(signal, async() => {
        console.log(`Recieved ${signal} shutting down...`);
        try {
          await disconnect_database();
          await new Promise(resolve => server.close(resolve));

          console.log("Graceful shutdown complete");
          process.exit(0);
        } catch (error) {
          console.log("Error during termiantion: ", error);
          process.exit(1); // exit with error
        }
      })
    })
}

const port = api_config.PORT;
const app = express();

async function initialize_application() {
  // Register middleware
  initialize_middlewares(app)
  initialize_routes(app)
  await connect_database();

  // run demo code below
  await simulation_engine_demo();
}

function start_server() {
  // Start server
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  initialize_graceful_shutdown(server);
}

initialize_application()
  .then(start_server)
  .catch(error => {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  })



// // Add a specific route for YAML files
// app.post('/api/yaml', async (req, res) => {
//   try {
//     const { name, content } = req.body;
//     // @ts-ignore
//     const userId = req.user?.id || req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Not authenticated" });
//     }

//     const User = require('./db/models/User').default;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Add the new YAML file
//     user.yamlFiles.push({ name, content, createdAt: new Date() });
//     await user.save();

//     // Return the newly added YAML file
//     const newFile = user.yamlFiles[user.yamlFiles.length - 1];
//     res.status(201).json(newFile);
//   } catch (error) {
//     console.error('Error adding YAML file:', error);
//     res.status(500).json({ success: false, message: "Error adding YAML file" });
//   }
// });

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




// // Add this near the end of your file, before scrapping_demo()
// function testRMDScraper() {
//   console.log("\n--- Testing RMD Scraper ---");
//   const { getRMDFactors } = require("./services/RMDScraper");
//   console.log(`RMD Factor for age 72: ${getRMDFactors(72)}`);
//   console.log(`RMD Factor for age 75: ${getRMDFactors(75)}`);
//   console.log(`RMD Factor for age 85: ${getRMDFactors(85)}`);
//   console.log("--- End RMD Scraper Test ---\n");
// }

