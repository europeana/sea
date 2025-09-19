import Redis from "ioredis";

let redisConnection;

export const useRedis = (runtimeConfig) => {
  if (!redisConnection) {
    redisConnection = new Redis(runtimeConfig.redis.url, {
      maxRetriesPerRequest: null,
      tls: runtimeConfig.redis.tls.ca
        ? {
            ca: Buffer.from(runtimeConfig.redis.tls.ca, "base64"),
          }
        : undefined,
    });
  }

  return redisConnection;
};
