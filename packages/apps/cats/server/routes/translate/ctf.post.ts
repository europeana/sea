import { defineEventHandler, getRequestHeader, readBody } from "h3";
import { useQueue } from "../../utils/bullmq/queue";

// TODO: auth or other abuse prevention
export default defineEventHandler(async (event) => {
  const entry = await readBody(event);

  const jobId = getRequestHeader(event, "X-Contentful-Idempotency-Key");

  await useQueue("translate-request").add(
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
