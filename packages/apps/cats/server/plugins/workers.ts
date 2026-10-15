import { defineNitroPlugin } from "nitropack/runtime";

import { useContactsQueueWorker } from "../utils/bullmq/workers/contacts";
import { useTranslateRequestQueueWorker } from "../utils/bullmq/workers/translate/request";
import { useTranslateReceiveQueueWorker } from "../utils/bullmq/workers/translate/receive";
import { useTranslateStoreQueueWorker } from "../utils/bullmq/workers/translate/store";

export default defineNitroPlugin(() => {
  useContactsQueueWorker();
  useTranslateRequestQueueWorker();
  useTranslateReceiveQueueWorker();
  useTranslateStoreQueueWorker();
});
