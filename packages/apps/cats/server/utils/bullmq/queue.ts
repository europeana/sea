import { Queue } from "bullmq";

const queues = {};

export const useQueue = (name) => {
  if (!queues[name]) {
    queues[name] = new Queue(name, {
      connection: useRedisConnection(),
    });
  }

  return queues[name];
};
