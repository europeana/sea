import { defineNitroPlugin } from "nitropack/runtime";

import { useTranslateRequestQueueWorker } from "../utils/bullmq/workers/translate/request";
import { useTranslateReceiveQueueWorker } from "../utils/bullmq/workers/translate/receive";
import { useTranslateStoreQueueWorker } from "../utils/bullmq/workers/translate/store";

export default defineNitroPlugin(() => {
  useTranslateRequestQueueWorker();
  useTranslateReceiveQueueWorker();
  useTranslateStoreQueueWorker();
});
