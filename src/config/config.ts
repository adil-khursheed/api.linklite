import { config } from "dotenv";

config();

export const _config = Object.freeze({
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  db_url: process.env.DB_URL,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  redis_uri: process.env.REDIS_URI,
  frontend_url: process.env.FRONTEND_URL,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
});
