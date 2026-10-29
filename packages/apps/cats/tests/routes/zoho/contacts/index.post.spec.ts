import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { FlowProducer } from "bullmq";
import { readBody, setResponseStatus } from "h3";

import routeHandler from "@/routes/zoho/contacts/index.post";

const mockFlowProducer = vi.mocked(FlowProducer);
const mockReadBody = vi.mocked(readBody);
const mockSetResponseStatus = vi.mocked(setResponseStatus);

describe("@/routes/zoho/contacts/index.post", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("route handler", () => {
    describe("when body includes id and modified", () => {
      const mockFlowProducerAdd = vi.fn();

      beforeEach(() => {
        mockFlowProducer.mockImplementation(
          class {
            add = mockFlowProducerAdd;
          },
        );
        mockReadBody.mockResolvedValue({
          id: "486281000001030363",
          modified: "1792656233000",
        });
      });

      it("queues a BullMQ flow with contact sync job, and child photo sync job", async () => {
        await routeHandler({});

        const flow = mockFlowProducerAdd.mock.calls[0][0];
        expect(flow.queueName).toBe("zoho-crm-sync-contact");
        expect(flow.name).toBe("sync-contact");
        expect(flow.data.contactId).toBe("486281000001030363");
        expect(flow.children).toHaveLength(1);
        expect(flow.children[0].queueName).toBe("zoho-crm-sync-photo");
        expect(flow.children[0].name).toBe("sync-photo");
        expect(flow.children[0].data.contactId).toBe("486281000001030363");
      });

      it("returns job ID derived from id and modified in body", async () => {
        const response = await routeHandler({});

        expect(response).toEqual({
          jobId: "zoho-crm-sync-contact-486281000001030363-1792656233000",
        });
      });
    });

    describe("when body does not include id and modified", () => {
      beforeEach(() => {
        mockReadBody.mockResolvedValue({});
      });

      it("send 400 response code", async () => {
        const event = {};
        await routeHandler(event);

        expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400);
      });

      it("returns error msg", async () => {
        const event = {};
        const response = await routeHandler(event);

        expect(response).toEqual({ error: "Bad Request" });
      });
    });
  });
});
