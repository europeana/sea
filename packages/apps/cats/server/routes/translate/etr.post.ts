import { defineEventHandler, readBody, H3Event } from "h3";
import { useQueue } from "../../utils/queues";
import { name as queueName } from "../../workers/translate/receive";

// TODO: validate format is "html"
export const handler = async (event: H3Event) => {
  const body = await readBody(event);

  const jobId = `${body.externalReference}-${body.targetLanguage}`;
  const job = await useQueue(queueName).getJob(jobId);
  await job.updateData({
    ...job.data,
    html: Buffer.from(body.result, "base64").toString("utf8"),
  });
  const isDelayed = await job.isDelayed();
  if (isDelayed) {
    await job.changeDelay(0);
  }

  return {
    jobId,
  };
};

export default defineEventHandler(handler);
