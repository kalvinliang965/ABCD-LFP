import express from "express";
import "./config/environment"; // load environment variables
//import "./auth/passport";
import { initialize_middlewares } from "./middleware";
import { connect_database, disconnect_database } from "./db/connections";
import { api_config } from "./config/api";
import { run_demo } from "./demos/demo";
import { Server } from "http";
import { initialize_route as initialize_routes } from "./routes";

// Graceful shutdown
async function initialize_graceful_shutdown(server: Server) {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Recieved ${signal} shutting down...`);
      try {
        await disconnect_database();
        await new Promise((resolve) => server.close(resolve));

        console.log("Graceful shutdown complete");
        process.exit(0);
      } catch (error) {
        console.log("Error during termiantion: ", error);
        process.exit(1); // exit with error
      }
    });
  });
}

const port = api_config.PORT;
const app = express();

async function initialize_application() {
  // Register middleware
  initialize_middlewares(app);
  initialize_routes(app);
  await connect_database();

  // run demo code below

  // await fetch_and_parse_rmd();
 // await run_demo()
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
  .catch((error) => {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  });
