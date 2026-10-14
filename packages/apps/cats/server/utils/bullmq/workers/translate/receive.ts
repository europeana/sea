import { Job, Worker } from "bullmq";
import { useQueueOptions } from "../../queue";
import { extractFields } from "../../../html/extractFields";

export const useTranslateReceiveQueueWorker = () =>
  new Worker("translate:receive", translateReceiveQueueWorker, {
    ...useQueueOptions(),
    removeOnComplete: { count: 100 },
    // removeOnFail: { count: 5000 },
  });

// TODO: handle situation where this has run due to delay expiring, but no webhook
//       yet called, i.e. check for job.data.html and if absent, re-delay job
export const translateReceiveQueueWorker = async (job: Job) => {
  console.log("translate:worker(receive)", job.id);

  const fields = extractFields(job.data);

  return {
    lang: job.data.lang,
    fields,
  };
};
