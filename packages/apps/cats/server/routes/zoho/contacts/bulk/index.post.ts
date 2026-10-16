import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";
import moment from "moment";

import { useQueue } from "../../../../utils/bullmq/queue";
import { ZohoBulkReadCriteria } from "../../../../utils/zoho";

export const handleRequestEventZohoContactsBulk = async (event: H3Event) => {
  const body: {
    criteria: ZohoBulkReadCriteria;
  } = await readBody(event);

  if (body.criteria) {
    const timestamp: number = moment().unix();
    // TODO: review derived job ID
    const jobId = `bulk-create-${timestamp}`;

    const job = await useQueue("contacts").add(
      "bulk-create",
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
      jobId: job.id,
    };
  }

  setResponseStatus(event, 400);
  return {
    error: "Bad Request",
  };
};

export default defineEventHandler(handleRequestEventZohoContactsBulk);
