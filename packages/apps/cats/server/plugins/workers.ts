export default defineNitroPlugin(() => {
  useRequestQueueWorker();
  useReceiveQueueWorker();
  useStoreQueueWorker();
});
