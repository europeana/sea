import { FlowJob } from "bullmq";
import { defineEventHandler, readBody, setResponseStatus } from "h3";
import moment from "moment";
import { useFlowProducer } from "../../utils/bullmq/queue";

const createSyncContactFlow = ({
  contactId,
  modified,
}: {
  contactId: string;
  modified: number;
}): FlowJob => {
  // derive job IDs from inputs for idempotency, e.g. "486281000001030363-1792058595000-contact"
  const contactJobId = `${contactId}-${modified}-contact`;
  const photoJobId = `${contactId}-${modified}-photo`;

  return {
    queueName: "zoho-contacts",
    name: "sync-contact",
    data: { contactId },
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
        queueName: "zoho-contacts",
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

export default defineEventHandler(async (event) => {
  const body: {
    id: string;
    modified: string;
  } = await readBody(event);

  if (body.id && body.modified) {
    // Zoho CRM Contact ID, e.g. "486281000001030363"
    const contactId: string = body.id;
    // Zoho CRM Contact Modified Time, e.g. "10-15-2026 11:03:15" (for 15th October)
    const modified: number = moment(
      body.modified,
      "MM-DD-YYYY hh:mm:ss",
    ).unix();

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
});
