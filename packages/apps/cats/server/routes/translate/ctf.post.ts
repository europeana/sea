import { defineEventHandler, getRequestHeader, readBody } from "h3";
import { useQueue } from "../../utils/queues";
import { name as queueName } from "../../workers/translate/request";

// TODO: auth or other abuse prevention
export default defineEventHandler(async (event) => {
  const entry = await readBody(event);

  const jobId = getRequestHeader(event, "X-Contentful-Idempotency-Key");

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
});
