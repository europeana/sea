import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { ZohoBulkReadCriteria } from "@europeana/zoho-client";

import { useZoho } from "@/utils/zoho";

export { name as queueName } from "@/queues/zoho/crm/createBulkRead";

export const processor = async (
  job: Job,
): Promise<{ zohoBulkReadJobId: string }> => {
  const criteria: ZohoBulkReadCriteria = job.data.criteria;
  const config = useRuntimeConfig()?.zoho;

  const response = await useZoho().crm.createZohoBulkReadJob(
    criteria,
    config?.bulkReadCallbackUrl,
  );

  const zohoBulkReadJobId = response.data[0].details.id;

  return {
    zohoBulkReadJobId,
  };
};

export const opts = {};
