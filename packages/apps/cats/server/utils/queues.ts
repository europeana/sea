import { FlowProducer, Queue } from "bullmq";
import { useRedisConnection } from "@/utils/redis";

const queues = {};
let flowProducer;

export const useQueue = (name: string): Queue => {
  queues[name] ||= new Queue(name, useQueueOptions());

  return queues[name];
};

export const useQueueOptions = () => {
  return {
    connection: useRedisConnection(),
    prefix: "@europeana:sea:cats",
  };
};

export const useFlowProducer = () => {
  flowProducer ||= new FlowProducer(useQueueOptions());
  return flowProducer;
};
