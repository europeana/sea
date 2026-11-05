import { defineNitroPlugin } from "nitropack/runtime";
import { Job, Worker } from "bullmq";

import { useQueueOptions } from "../utils/bullmq/queue";

import translateWorkers from "../workers/translate/index";

const workers = [translateWorkers].flat();

export default defineNitroPlugin(() => {
  for (const worker of workers) {
    new Worker(
      worker.name,
      (job: Job) => {
        // TODO: can we use the nitro logger for this? from logging plugin
        console.log(`worker(${worker.name}): ${job.id}`);
        return worker.processor(job);
      },
      {
        ...useQueueOptions(),
        ...worker.opts,
      },
    );
  }
});
