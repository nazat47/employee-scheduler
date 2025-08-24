import app from "./app";
import http from "http";
import { appConfig } from "./config";
import { connectToDB, disconnectFromDB } from "./db/connection";
import seed from "./scripts/seed-data";
let server = http.createServer(app);

const port = appConfig.port;

(async () => {
  try {
    await connectToDB();
    await seed();
    server.listen(port, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 Server Started Successfully!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🔗 Listening on: http://localhost:${port}`);
      console.log(`📅 Started at: ${new Date().toLocaleString()}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  } catch (error) {
    console.log(`❌ Error starting server:`, error);
    process.exit(1);
  }
})();

const shutdown = async (signal: string) => {
  try {
    console.log(`📦 ${signal} received. Cleaning up...`);

    await disconnectFromDB();

    server.close(() => {
      console.log(`HTTP server closed`);
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", async () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection: ${err}`);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err}`);
  process.exit(1);
});
