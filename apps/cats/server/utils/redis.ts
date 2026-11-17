import Redis from "ioredis";
import { useRuntimeConfig } from "nitropack/runtime";

let sharedRedisConnection: Redis;

export const createRedisConnection = (): Redis => {
  const runtimeConfig = useRuntimeConfig();

  return new Redis(runtimeConfig?.redis?.url, {
    maxRetriesPerRequest: null,
    tls: runtimeConfig?.redis?.tls?.ca
      ? {
          ca: Buffer.from(runtimeConfig.redis.tls.ca, "base64"),
        }
      : undefined,
  });
};

export const useRedisConnection = (): Redis => {
  if (!sharedRedisConnection) {
    sharedRedisConnection = createRedisConnection();
    // Allow multiple consumers to attach error listeners without triggering Node's default limit of 10
    sharedRedisConnection.setMaxListeners(20);
  }

  return sharedRedisConnection;
};
