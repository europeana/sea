import { Queue } from "bullmq";

let queues;

export const useQueues = (runtimeConfig) => {
  if (!queues) {
    const redisConnection = useRedis(runtimeConfig);

    queues = ["receive", "translate"].reduce((memo, name) => {
      memo[name] = new Queue(name, {
        connection: redisConnection,
      });
      return memo;
    }, {});
  }

  return queues;
};
