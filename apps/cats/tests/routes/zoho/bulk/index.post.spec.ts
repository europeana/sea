import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Queue } from "bullmq";
import { readBody, setResponseStatus } from "h3";

import routeHandler from "@/routes/zoho/bulk/index.post";

const mockQueue = vi.mocked(Queue);
const mockReadBody = vi.mocked(readBody);
const mockSetResponseStatus = vi.mocked(setResponseStatus);

describe("@/routes/zoho/bulk/index.post", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    const fakeDate = new Date("2026-10-22T12:00:00.000+00:00").valueOf(); // timestamp: 1792670400000
    vi.setSystemTime(fakeDate);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe("route handler", () => {
    describe("when body includes criteria", () => {
      const criteria = {
        field: {
          api_name: "Contact_Participation",
        },
        comparator: "contains",
        value: ["Staff"],
      };

      const mockQueueAdd = vi.fn();

      beforeEach(() => {
        mockQueue.mockImplementation(
          class {
            add = mockQueueAdd;
          },
        );
        mockReadBody.mockResolvedValue({
          criteria,
        });
      });

      it("queues a BullMQ job with the criteria", async () => {
        const event = {};
        await routeHandler(event);

        expect(mockQueueAdd).toHaveBeenCalledWith(
          "create-bulk-read",
          { criteria },
          { jobId: "zoho-crm-create-bulk-read-1792670400000", attempts: 1 },
        );
      });

      it("returns job ID", async () => {
        const event = {};
        const response = await routeHandler(event);

        expect(response).toEqual({
          jobId: "zoho-crm-create-bulk-read-1792670400000",
        });
      });
    });

    describe("when body does not include criteria", () => {
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
