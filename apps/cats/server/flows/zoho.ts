import { FlowJob } from "bullmq";
import { ZohoContactRecord } from "@europeana/zoho-client";

import { name as syncContactQueueName } from "@/workers/zoho/crm/syncContact";
import { name as syncPhotoQueueName } from "@/workers/zoho/crm/syncPhoto";

export interface SyncContactFlowInput {
  contactId: string;
  modified: string | number;
  record?: ZohoContactRecord;
}

export const createSyncContactFlow = ({
  contactId,
  modified,
  record,
}: SyncContactFlowInput): FlowJob => {
  // Derive job IDs from inputs for idempotency
  const contactJobId = `${syncContactQueueName}-${contactId}-${modified}`;
  const photoJobId = `${syncPhotoQueueName}-${contactId}-${modified}`;

  return {
    queueName: syncContactQueueName,
    name: "sync-contact",
    data: { contactId, contactRecord: record },
    opts: {
      jobId: contactJobId,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 10_000,
      },
    },
    children: [
      {
        queueName: syncPhotoQueueName,
        name: "sync-photo",
        data: { contactId },
        opts: {
          jobId: photoJobId,
          attempts: 5,
          backoff: {
            type: "fixed",
            delay: 60_000,
          },
        },
      },
    ],
  };
};
