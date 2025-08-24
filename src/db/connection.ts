import mongoose from "mongoose";
import { appConfig } from "../config";

export const connectToDB = async () => {
  try {
    const url = appConfig.dbUrl;
    await mongoose.connect(url as string, {
      maxPoolSize: 100,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxIdleTimeMS: 10000,
      waitQueueTimeoutMS: 10000,
    });

    console.log("✅ Database connected successfully");

    mongoose.connection.on("error", (error) => {
      console.log("⚠️ Db Connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Db disconnected");
    });
  } catch (error) {
    console.log("❌ Error connecting to database:", error);
    process.exit(1);
  }
};

export const disconnectFromDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("✅ Database disconnected successfully");
    }
  } catch (error) {
    console.log("❌ Error disconnecting from database:", error);
    process.exit(1);
  }
};
