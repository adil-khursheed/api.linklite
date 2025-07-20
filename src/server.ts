/* eslint-disable @typescript-eslint/no-unused-expressions */

import { app } from "./app.js";
import { _config } from "./config/config.js";
import connectDB from "./config/db.js";
import { emailVerificationWorker } from "./services/bullmq/worker.js";
import { logger } from "./utils/winstonLogger.js";

const startServer = async () => {
  await connectDB();

  // Workers
  emailVerificationWorker;

  const port = _config.port || 4000;

  app.listen(port, () => {
    logger.info(`🚀 Server is running on port ${port}.`);
  });
};

startServer();
