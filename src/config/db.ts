import mongoose from "mongoose";
import { _config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("🎉 Database connected successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Error while connecting to database:", err);
    });

    await mongoose.connect(_config.db_url as string);
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

export default connectDB;
