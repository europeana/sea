import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { FlowJob, FlowProducer } from "bullmq";
import { H3Event, readBody, setResponseStatus } from "h3";

import { createSyncContactFlow } from "@/flows/zoho";
import routeHandler from "@/routes/zoho/contacts/index.post";

vi.mock("@/flows/zoho", () => ({
  createSyncContactFlow: vi.fn(),
}));

const mockCreateSyncContactFlow = vi.mocked(createSyncContactFlow);
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
      const mockFlow: FlowJob = {
        queueName: "zoho-crm-sync-contact",
        name: "sync-contact",
        data: { contactId: "486281000001030363" },
        opts: {
          jobId: "zoho-crm-sync-contact-486281000001030363-1792656233000",
        },
      };

      beforeEach(() => {
        mockFlowProducer.mockImplementation(
          class {
            add = mockFlowProducerAdd;
          } as unknown as typeof FlowProducer,
        );
        mockCreateSyncContactFlow.mockReturnValue(mockFlow);
        mockReadBody.mockResolvedValue({
          id: "486281000001030363",
          modified: "1792656233000",
        });
      });

      it("creates a sync contact flow and adds it to FlowProducer", async () => {
        await routeHandler({} as H3Event);

        expect(mockCreateSyncContactFlow).toHaveBeenCalledWith({
          contactId: "486281000001030363",
          modified: "1792656233000",
        });
        expect(mockFlowProducerAdd).toHaveBeenCalledWith(mockFlow);
      });

      it("returns the job ID from the created flow", async () => {
        const response = await routeHandler({} as H3Event);

        expect(response).toEqual({
          jobId: "zoho-crm-sync-contact-486281000001030363-1792656233000",
        });
      });
    });

    describe("when body does not include id and modified", () => {
      beforeEach(() => {
        mockReadBody.mockResolvedValue({});
      });

      it("sends 400 response code", async () => {
        const event = {} as H3Event;
        await routeHandler(event);

        expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400);
      });

      it("returns error message", async () => {
        const event = {} as H3Event;
        const response = await routeHandler(event);

        expect(response).toEqual({ error: "Bad Request" });
      });
    });
  });
});
