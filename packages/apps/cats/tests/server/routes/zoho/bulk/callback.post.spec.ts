import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Queue } from "bullmq";
import { readBody, setResponseStatus } from "h3";

import routeHandler from "../../../../../server/routes/zoho/bulk/callback.post";

const mockQueue = vi.mocked(Queue);
const mockReadBody = vi.mocked(readBody);
const mockSetResponseStatus = vi.mocked(setResponseStatus);

describe("@/server/routes/zoho/bulk/callback.post", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("route handler", () => {
    describe("when body includes job_id and state", () => {
      const body = {
        job_id: "486281000037206001",
        state: "COMPLETED",
      };
      const mockQueueAdd = vi.fn();

      beforeEach(() => {
        mockQueue.mockImplementation(
          class {
            add = mockQueueAdd;
          },
        );
        mockReadBody.mockResolvedValue(body);
      });

      it("queues a BullMQ job with the Zoho Bulk Read job ID", async () => {
        const event = {};
        await routeHandler(event);

        expect(mockQueueAdd).toHaveBeenCalledWith(
          "process-bulk-read",
          { zohoBulkReadJobId: "486281000037206001" },
          {
            jobId: "zoho-crm-process-bulk-read-486281000037206001",
            attempts: 1,
          },
        );
      });

      it("returns job ID", async () => {
        const event = {};
        const response = await routeHandler(event);

        expect(response).toEqual({
          jobId: "zoho-crm-process-bulk-read-486281000037206001",
        });
      });
    });

    describe("when body does not include job_id and state", () => {
      beforeEach(() => {
        mockReadBody.mockResolvedValue({});
      });

      it("sends 400 response code", async () => {
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
