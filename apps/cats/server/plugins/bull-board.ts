import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { H3Adapter } from "@bull-board/h3";
import { defineNitroPlugin } from "nitropack/runtime";

import queues from "@/queues/index";
import { useQueue } from "@/utils/bullmq";

export default defineNitroPlugin((nitroApp) => {
  const basePath = "/admin";
  const serverAdapter = new H3Adapter();
  serverAdapter.setBasePath(basePath);

  createBullBoard({
    queues: queues.map(
      (queueSpec) => new BullMQAdapter(useQueue(queueSpec.name)),
    ),
    serverAdapter,
  });

  const handler = serverAdapter.registerHandlers().handler;

  nitroApp.router.use(basePath, handler);
  nitroApp.router.use(`${basePath}/**`, handler);
});
