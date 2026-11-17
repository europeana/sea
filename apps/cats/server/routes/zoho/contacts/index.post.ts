import { defineEventHandler, readBody, setResponseStatus, H3Event } from "h3";
import { useFlowProducer } from "@/utils/queues";
import { createSyncContactFlow } from "@/flows/zoho";

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

    // Queue BullMQ flow for contact sync job, with photo sync job as child
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
