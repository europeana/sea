import { Job } from "bullmq";

import { ZohoBulkReadCriteria } from "@/services/zoho/types";
import { useZoho } from "@/utils/zoho";

export { name, processor, opts };

const name = "zoho-crm-create-bulk-read";

const processor = async (job: Job): Promise<{ zohoBulkReadJobId: string }> => {
  const criteria: ZohoBulkReadCriteria = job.data.criteria;

  const response = await useZoho().crm.createZohoBulkReadJob(criteria);

  const zohoBulkReadJobId = response.data[0].details.id;

  return {
    zohoBulkReadJobId,
  };
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};
