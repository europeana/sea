import { Queue } from "bullmq";
import { useRedisConnection } from "../redisConnection";

const queues = {};

export const useQueue = (name) => {
  queues[name] ||= new Queue(name, useQueueOptions());

  return queues[name];
};

export const useQueueOptions = () => {
  return {
    connection: useRedisConnection(),
    prefix: "@europeana:sea:cats",
  };
};
