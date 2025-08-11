import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = redisDriver({
    base: "@europeana:portal.js:",
    url: useRuntimeConfig().redis.url,
  });

  storage.mount("redis", driver);
});
