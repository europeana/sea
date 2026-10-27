import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";

import { name as queueName } from "@/workers/zoho/crm/createBulkRead";
import { useQueue } from "@/utils/queues";
import { ZohoBulkReadCriteria } from "@/services/zoho/crm";

export const handler = async (event: H3Event) => {
  const body: {
    criteria: ZohoBulkReadCriteria;
  } = await readBody(event);

  if (body.criteria) {
    const timestamp: number = Date.now();
    // TODO: review derived job ID
    const jobId = `${queueName}-${timestamp}`;

    await useQueue(queueName).add(
      "create-bulk-read",
      { criteria: body.criteria },
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
      jobId,
    };
  }

  setResponseStatus(event, 400);
  return {
    error: "Bad Request",
  };
};

export default defineEventHandler(handler);
