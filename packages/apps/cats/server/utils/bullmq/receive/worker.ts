import { Job, Worker } from "bullmq";

export const useReceiveQueueWorker = () =>
  new Worker("receive", receiveQueueWorker, {
    connection: useRedisConnection(),
  });

export const receiveQueueWorker = async (job: Job) => {
  console.log("worker(receive)", job.id);

  const fields = extractFields(job.data);

  return {
    lang: job.data.lang,
    fields,
  };
};
