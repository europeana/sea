export default defineNitroPlugin(() => {
  useReceiveQueueWorker();
  useTranslateQueueWorker();
});
