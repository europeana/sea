import { FlowJob } from "bullmq";
import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";
import { useFlowProducer } from "../../../utils/queues";

import { name as syncContactQueueName } from "../../../workers/zoho/crm/syncContact";
import { name as syncPhotoQueueName } from "../../../workers/zoho/crm/syncPhoto";

export const createSyncContactFlow = ({
  contactId,
  modified,
  record,
}: {
  contactId: string;
  modified: string;
  record?: object;
}): FlowJob => {
  // derive job IDs from inputs for idempotency
  const contactJobId = `${syncContactQueueName}-${contactId}-${modified}`;
  const photoJobId = `${syncPhotoQueueName}-${contactId}-${modified}`;

  return {
    queueName: syncContactQueueName,
    name: "sync-contact",
    data: { contactId, contactRecord: record },
    opts: {
      jobId: contactJobId,
      // TODO: are these good settings for attempts and backoff?
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

export const handler = async (event: H3Event) => {
  const body: {
    id?: string;
    modified?: string;
  } = await readBody(event);

  if (body?.id && body?.modified) {
    // Zoho CRM Contact ID, e.g. "486281000001030363"
    const contactId: string = body.id;
    // Zoho CRM Contact Modified Time, as UTC timestamp
    const modified: string = body.modified;

    // queue BullMQ flow for contact sync job. with photo sync job as child
    const flow = createSyncContactFlow({ contactId, modified });
    const flowProducer = useFlowProducer();
    await flowProducer.add(flow);

    return {
      jobId: flow.opts?.jobId,
    };
  }

  setResponseStatus(event, 400);
  return {
    error: "Bad Request",
  };
};

export default defineEventHandler(handler);
