import { defineNitroPlugin } from "nitropack/runtime";
import { Job, Worker } from "bullmq";

import { useWorkerOptions } from "@/utils/bullmq";

import translateWorkers from "@/workers/translate/index";
import zohoCRMWorkers from "@/workers/zoho/crm/index";

const workers = [translateWorkers, zohoCRMWorkers].flat();

export default defineNitroPlugin((nitroApp) => {
  const activeWorkers: Worker[] = [];

  for (const worker of workers) {
    activeWorkers.push(
      new Worker(
        worker.queueName,
        (job: Job) => {
          // TODO: can we use the nitro logger for this? from logging plugin
          console.log(`worker(${worker.queueName}): ${job.id}`);
          return worker.processor(job);
        },
        {
          ...useWorkerOptions(),
          ...worker.opts,
        },
      ),
    );
  }

  nitroApp.hooks.hook("close", async () => {
    await Promise.all(activeWorkers.map((worker) => worker.close()));
  });
});
