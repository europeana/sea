import { Job, Worker } from "bullmq";

export const useReceiveQueueWorker = () =>
  new Worker("receive", receiveQueueWorker, {
    ...useQueueOptions(),
    removeOnComplete: { count: 100 },
    // removeOnFail: { count: 5000 },
  });

// TODO: handle situation where this has run due to delay expiring, but no webhook
//       yet called, i.e. check for job.data.html and if absent, re-delay job
export const receiveQueueWorker = async (job: Job) => {
  console.log("worker(receive)", job.id);

  const fields = extractFields(job.data);

  return {
    lang: job.data.lang,
    fields,
  };
};
