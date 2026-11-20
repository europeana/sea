import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { ZohoBulkReadCriteria } from "@europeana/zoho-client";

import { useZoho } from "@/utils/zoho";

export { name as queueName } from "@/queues/zoho/crm/createBulkRead";

const CONTACT_BULK_READ_FIELDS = [
  "id",
  "Full_Name",
  "Public_email",
  "LinkedIn",
  "Communities",
  "Contact_Participation",
  "Country_new",
  "Title",
  "Modified_Time",
  "Europeana_Initiative_role_chair",
  "Europeana_Initiative_role_vice_chair",
  "Europeana_Initiative_role_treasurer",
  "Europeana_Initiative_role_member",
];

export const processor = async (
  job: Job,
): Promise<{ zohoBulkReadJobId: string }> => {
  const criteria: ZohoBulkReadCriteria = job.data.criteria;
  const config = useRuntimeConfig()?.zoho;

  const response = await useZoho().crm.createZohoBulkReadJob(
    criteria,
    config?.bulkReadCallbackUrl,
    CONTACT_BULK_READ_FIELDS,
  );

  const zohoBulkReadJobId = response.data[0].details.id;

  return {
    zohoBulkReadJobId,
  };
};

export const opts = {};
