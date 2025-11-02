import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { _config } from "../../config/config";

const redis_uri = _config.redis_uri as string;

const redisConnection = new Redis(redis_uri);

export const emailVerificationQueue = new Queue("emailVerification", {
  connection: redisConnection,
});

export const forgotPasswordQueue = new Queue("forgotPassword", {
  connection: redisConnection,
});

export const sendInviteEmailQueue = new Queue("sendInviteEmail", {
  connection: redisConnection,
});
