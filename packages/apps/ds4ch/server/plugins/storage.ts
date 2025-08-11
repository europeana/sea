import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = redisDriver({
    base: "@europeana:portal.js:",
    url: useRuntimeConfig().redis.url,
  });

  // Mount driver
  storage.mount("redis", driver);
});
