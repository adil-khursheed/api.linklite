import mongoose from "mongoose";
import { _config } from "./config";
import { logger } from "../utils/winstonLogger";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      logger.info("🎉 Database connected successfully!");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Error while connecting to database:", err);
    });

    await mongoose.connect(_config.db_url as string);
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

export default connectDB;
