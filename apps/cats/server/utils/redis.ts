import type { ConnectionOptions } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";

export const useRedisConnectionOptions = (): ConnectionOptions => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig?.redis?.url;

  return {
    ...(url ? { url } : {}),
    maxRetriesPerRequest: null,
    ...(runtimeConfig?.redis?.tls?.ca
      ? {
          tls: {
            ca: Buffer.from(runtimeConfig.redis.tls.ca, "base64"),
          },
        }
      : {}),
  };
};
