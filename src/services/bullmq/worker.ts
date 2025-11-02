import Redis from "ioredis";
import { _config } from "../../config/config";
import { Worker, WorkerOptions } from "bullmq";
import { logger } from "../../utils/winstonLogger";
import { sendMail } from "../../utils/sendMail";

const redis_uri = _config.redis_uri as string;

const sharedConnection = new Redis(redis_uri, { maxRetriesPerRequest: null });

const workerOptions: WorkerOptions = {
  connection: sharedConnection,
  concurrency: 1,
  limiter: {
    max: 10,
    duration: 1000,
  },
  lockDuration: 60000,
  removeOnComplete: {
    age: 30000,
  },
  removeOnFail: {
    age: 20 * 24 * 60 * 60,
  },
};

export const emailVerificationWorker = new Worker(
  "emailVerification",
  async (job) => {
    logger.info("Email verification job started");
    await sendMail(job.data.options);
    logger.info("Email verification job completed");
  },
  workerOptions
);

emailVerificationWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(
      `Email verification job failed for job ${job.id} with error: ${err.message}`
    );
  } else {
    logger.error(`Email verification job failed with error: ${err.message}`);
  }
});

emailVerificationWorker.on("completed", (job) => {
  if (job) {
    logger.info(`Email verification job completed for job ${job.id}`);
  }
});

export const forgotPasswordWorker = new Worker(
  "forgotPassword",
  async (job) => {
    logger.info("Forgot password job started");
    await sendMail(job.data.options);
    logger.info("Forgot password job completed");
  },
  workerOptions
);

forgotPasswordWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(
      `Forgot password job failed for job ${job.id} with error: ${err.message}`
    );
  } else {
    logger.error(`Forgot password job failed with error: ${err.message}`);
  }
});

forgotPasswordWorker.on("completed", (job) => {
  if (job) {
    logger.info(`Forgot password job completed for job ${job.id}`);
  }
});

export const sendInviteEmailWorker = new Worker(
  "sendInviteEmail",
  async (job) => {
    logger.info("Send invite email job started");
    await sendMail(job.data.options);
    logger.info("Send invite email job completed");
  },
  workerOptions
);

sendInviteEmailWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(
      `Send invite email job failed for job ${job.id} with error: ${err.message}`
    );
  } else {
    logger.error(`Send invite email job failed with error: ${err.message}`);
  }
});

sendInviteEmailWorker.on("completed", (job) => {
  if (job) {
    logger.info(`Send invite email job completed for job ${job.id}`);
  }
});
