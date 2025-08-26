import Redis from "ioredis";
import { _config } from "../../config/config";
import { logger } from "../../utils/winstonLogger";

const redisUri = _config.redis_uri as string;
const redis = new Redis(redisUri);

redis.on("connect", () => logger.info("🤝 Redis connected"));
redis.on("error", (err) => {
  logger.error("Redis error", err);
  redis!.disconnect();
});

export default redis;
