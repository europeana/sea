import { defineNitroPlugin } from "nitropack/runtime";
import { Job, Worker } from "bullmq";

import { useQueueOptions } from "@/utils/queues";

import translateWorkers from "@/workers/translate/index";
import zohoCRMWorkers from "@/workers/zoho/crm/index";

const workers = [translateWorkers, zohoCRMWorkers].flat();

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
