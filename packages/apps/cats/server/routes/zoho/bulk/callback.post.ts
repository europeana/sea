import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";

import { name as queueName } from "../../../workers/zoho/crm/processBulkRead";
import { useQueue } from "../../../utils/queues";

export const handler = async (event: H3Event) => {
  const body: {
    job_id: string;
    state: string;
  } = await readBody(event);

  if (body["job_id"] && body.state) {
    // TODO: if not "COMPLETED", then do what? error here? s'thing else?
    if (body.state === "COMPLETED") {
      const jobId = `${queueName}-${body["job_id"]}`;

      const job = await useQueue(queueName).add(
        "process-bulk-read",
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

export default defineEventHandler(handler);
