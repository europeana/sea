export default defineNitroPlugin(async () => {
  useReceiveQueueWorker();
  useTranslateQueueWorker();
});
