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
import routeHandler from "../../../../../server/routes/zoho/bulk/index.post";

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

const fakeDate = new Date("2026-10-22T12:00:00.000+00:00").valueOf(); // timestamp: 1792670400000

describe("@/server/routes/zoho/bulk/index.post", () => {
  beforeAll(() => {
    vi.useFakeTimers();
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

      beforeEach(() => {
        mocks.h3.readBody.mockResolvedValue({
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
