import { app } from "./app.js";
import { _config } from "./config/config.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  await connectDB();

  const port = _config.port || 4000;

  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}.`);
  });
};

startServer();
