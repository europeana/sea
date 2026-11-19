import { defineNitroPlugin } from "nitropack/runtime";
import { Worker } from "bullmq";

import { useWorkerOptions } from "@/utils/bullmq";

import workers from "@/workers/index";

export default defineNitroPlugin((nitroApp) => {
  const activeWorkers: Worker[] = [];

  for (const worker of workers) {
    activeWorkers.push(
      new Worker(worker.queueName, worker.processor, {
        ...useWorkerOptions(),
        ...worker.opts,
      }),
    );
  }

  nitroApp.hooks.hook("close", async () => {
    await Promise.all(activeWorkers.map((worker) => worker.close()));
  });
});
