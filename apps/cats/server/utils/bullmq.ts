import {
  ConnectionOptions,
  FlowProducer,
  Queue,
  QueueOptions,
  WorkerOptions,
} from "bullmq";
import { createRedisConnection, useRedisConnection } from "@/utils/redis";

const queues: Record<string, Queue> = {};
let flowProducer: FlowProducer | undefined;

const prefix = "@europeana:sea:cats";

export const useQueue = (name: string): Queue => {
  queues[name] ||= new Queue(name, useQueueOptions());

  return queues[name];
};

export const useQueueOptions = (): QueueOptions => {
  return {
    // Queues and FlowProducers run non-blocking commands and can safely share one Redis connection
    connection: useRedisConnection() as unknown as ConnectionOptions,
    prefix,
  };
};

export const useWorkerOptions = (): WorkerOptions => {
  return {
    // Workers use blocking Redis commands and require dedicated connections
    connection: createRedisConnection() as unknown as ConnectionOptions,
    prefix,
  };
};

export const useFlowProducer = (): FlowProducer => {
  flowProducer ||= new FlowProducer(useQueueOptions());

  return flowProducer;
};
