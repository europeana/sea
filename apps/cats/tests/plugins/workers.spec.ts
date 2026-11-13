import { describe, it, expect, vi, beforeEach } from "vitest";
import { Worker, type Job } from "bullmq";
import { useQueueOptions } from "@/utils/queues";
import workersPlugin from "@/plugins/workers";

const { mockTranslateWorker, mockZohoWorker } = vi.hoisted(() => ({
  mockTranslateWorker: {
    name: "translate-worker",
    processor: vi.fn(),
    opts: { concurrency: 2 },
  },
  mockZohoWorker: {
    name: "zoho-crm-sync-contact",
    processor: vi.fn(),
    opts: { removeOnComplete: { count: 0 } },
  },
}));

vi.mock("nitropack/runtime", () => ({
  defineNitroPlugin: vi.fn((fn) => fn),
}));

vi.mock("bullmq", () => ({
  Worker: vi.fn(),
}));

vi.mock("@/utils/queues", () => ({
  useQueueOptions: vi.fn(),
}));

vi.mock("@/workers/translate/index", () => ({
  default: [mockTranslateWorker],
}));

vi.mock("@/workers/zoho/crm/index", () => ({
  default: [mockZohoWorker],
}));

describe("@/plugins/workers", () => {
  const defaultQueueOptions = {
    connection: { host: "localhost", port: 6379 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueueOptions).mockReturnValue(
      defaultQueueOptions as ReturnType<typeof useQueueOptions>,
    );
  });

  it("instantiates a single BullMQ Worker per worker definition with merged options", () => {
    workersPlugin({} as never);

    expect(Worker).toHaveBeenCalledTimes(2);

    expect(Worker).toHaveBeenNthCalledWith(
      1,
      "translate-worker",
      expect.any(Function),
      {
        ...defaultQueueOptions,
        concurrency: 2,
      },
    );

    expect(Worker).toHaveBeenNthCalledWith(
      2,
      "zoho-crm-sync-contact",
      expect.any(Function),
      {
        ...defaultQueueOptions,
        removeOnComplete: { count: 0 },
      },
    );
  });

  it("logs the worker name and job ID and delegates execution to worker.processor", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockZohoWorker.processor.mockResolvedValue({ entryId: "cf-123" });

    workersPlugin({} as never);

    const registeredHandler = vi.mocked(Worker).mock.calls[1][1] as (
      job: Job,
    ) => Promise<unknown>;

    const mockJob = { id: "job-42" } as Job;
    const result = await registeredHandler(mockJob);

    expect(consoleSpy).toHaveBeenCalledWith(
      "worker(zoho-crm-sync-contact): job-42",
    );
    expect(mockZohoWorker.processor).toHaveBeenCalledWith(mockJob);
    expect(result).toEqual({ entryId: "cf-123" });

    consoleSpy.mockRestore();
  });

  it("allows worker.opts to override defaults from useQueueOptions", () => {
    vi.mocked(useQueueOptions).mockReturnValue({
      connection: { host: "localhost", port: 6379 },
      concurrency: 1,
    } as ReturnType<typeof useQueueOptions>);

    workersPlugin({} as never);

    expect(Worker).toHaveBeenNthCalledWith(
      1,
      "translate-worker",
      expect.any(Function),
      {
        connection: { host: "localhost", port: 6379 },
        concurrency: 2,
      },
    );
  });
});
