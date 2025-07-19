import { config } from "dotenv";

config();

export const _config = Object.freeze({
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  db_url: process.env.DB_URL,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
});
