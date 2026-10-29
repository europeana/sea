import { defineEventHandler, getRequestHeader, readBody, H3Event } from "h3";
import { useQueue } from "@/utils/queues";
import { name as queueName } from "@/workers/translate/request";

export const handler = async (event: H3Event) => {
  const entry = await readBody(event);

  const contentfulIdempotencyKey = getRequestHeader(
    event,
    "X-Contentful-Idempotency-Key",
  );
  const jobId = `${queueName}-${contentfulIdempotencyKey}`;

  await useQueue(queueName).add(
    "translation",
    { entry },
    {
      jobId,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 60_000,
      },
    },
  );

  return {
    jobId,
  };
};

export default defineEventHandler(handler);
