import { FlowProducer, Queue, QueueOptions, WorkerOptions } from "bullmq";
import { useRedisConnectionOptions } from "@/utils/redis";

const queues: Record<string, Queue> = {};
let flowProducer: FlowProducer | undefined;

const prefix = "@europeana:sea:cats";

export const useQueue = (name: string): Queue => {
  queues[name] ||= new Queue(name, useQueueOptions());

  return queues[name];
};

export const useQueueOptions = (): QueueOptions => {
  return {
    connection: useRedisConnectionOptions(),
    prefix,
  };
};

export const useWorkerOptions = (): WorkerOptions => {
  return {
    connection: useRedisConnectionOptions(),
    prefix,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 },
  };
};

export const useFlowProducer = (): FlowProducer => {
  flowProducer ||= new FlowProducer(useQueueOptions());

  return flowProducer;
};
