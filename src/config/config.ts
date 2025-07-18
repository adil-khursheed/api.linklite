import { config } from "dotenv";

config();

export const _config = Object.freeze({
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  db_url: process.env.DB_URL,
});
