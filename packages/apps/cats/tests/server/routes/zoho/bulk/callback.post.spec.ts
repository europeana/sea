import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import routeHandler from "../../../../../server/routes/zoho/bulk/callback.post";

const mocks = vi.hoisted(() => {
  return {
    bullmq: {
      Queue: vi.fn(),
    },
    h3: {
      defineEventHandler: vi.fn().mockImplementation((callback) => callback),
      readBody: vi.fn(),
      setResponseStatus: vi.fn(),
    },
    ioredis: {
      Redis: vi.fn(class {}),
    },
    "nitropack/runtime": {
      useRuntimeConfig: vi.fn().mockReturnValue({ redis: {} }),
    },
  };
});

vi.mock("bullmq", () => {
  return {
    Queue: mocks.bullmq.Queue,
  };
});
vi.mock("h3", () => {
  return {
    defineEventHandler: mocks.h3.defineEventHandler,
    readBody: mocks.h3.readBody,
    setResponseStatus: mocks.h3.setResponseStatus,
  };
});
vi.mock("nitropack/runtime", () => {
  return {
    useRuntimeConfig: mocks["nitropack/runtime"].useRuntimeConfig,
  };
});
vi.mock("ioredis", () => {
  return {
    default: mocks.ioredis.Redis,
  };
});

const mockQueueAdd = vi.fn();
mocks.bullmq.Queue.mockImplementation(
  class {
    add = mockQueueAdd;
  },
);

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

      beforeEach(() => {
        mocks.h3.readBody.mockResolvedValue(body);
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
        mocks.h3.readBody.mockResolvedValue({});
      });

      it("sends 400 response code", async () => {
        const event = {};
        await routeHandler(event);

        expect(mocks.h3.setResponseStatus).toHaveBeenCalledWith(event, 400);
      });

      it("returns error msg", async () => {
        const event = {};
        const response = await routeHandler(event);

        expect(response).toEqual({ error: "Bad Request" });
      });
    });
  });
});
