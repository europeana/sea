import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";

import { useQueue } from "../../../../utils/bullmq/queue";

export const handleRequestEventZohoContactsBulkCallback = async (
  event: H3Event,
) => {
  const body: {
    job_id: string;
    state: string;
  } = await readBody(event);

  if (body["job_id"] && body.state) {
    // TODO: if not "COMPLETED", then do what? error here? s'thing else?
    if (body.state === "COMPLETED") {
      const jobId = `bulk-result-${body["job_id"]}`;

      const job = await useQueue("contacts").add(
        "bulk-result",
        { zohoBulkReadJobId: body["job_id"] },
        {
          jobId,
          // TODO: review attempts & backoff
          attempts: 1,
          // backoff: {
          //   type: "fixed",
          //   delay: 60_000,
          // },
        },
      );

      return {
        jobId: job.id,
      };
    }
  }

  setResponseStatus(event, 400);
  return {
    error: "Bad Request",
  };
};

export default defineEventHandler(handleRequestEventZohoContactsBulkCallback);
