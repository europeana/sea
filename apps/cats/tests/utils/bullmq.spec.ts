import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowProducer, Queue } from "bullmq";
import { useRedisConnectionOptions } from "@/utils/redis";

vi.mock("@/utils/redis", () => ({
  useRedisConnectionOptions: vi.fn(),
}));

describe("@/utils/bullmq", () => {
  const mockConnectionOptions = {
    url: "redis://localhost:6379",
    maxRetriesPerRequest: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(useRedisConnectionOptions).mockReturnValue(mockConnectionOptions);
  });

  describe("useQueueOptions", () => {
    it("returns BullMQ options with Redis connection options and prefix", async () => {
      const { useQueueOptions } = await import("@/utils/bullmq");

      const options = useQueueOptions();

      expect(useRedisConnectionOptions).toHaveBeenCalledTimes(1);
      expect(options).toEqual({
        connection: mockConnectionOptions,
        prefix: "@europeana:sea:cats",
      });
    });
  });

  describe("useWorkerOptions", () => {
    it("returns BullMQ options with Redis connection options and prefix", async () => {
      const { useWorkerOptions } = await import("@/utils/bullmq");

      const options = useWorkerOptions();

      expect(useRedisConnectionOptions).toHaveBeenCalledTimes(1);
      expect(options).toEqual({
        connection: mockConnectionOptions,
        prefix: "@europeana:sea:cats",
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 1000 },
      });
    });
  });

  describe("useQueue", () => {
    it("creates and returns a Queue instance with the given name and queue options", async () => {
      const mockQueueInstance = { name: "translate-request" } as Queue;
      vi.mocked(Queue).mockImplementation(function () {
        return mockQueueInstance;
      });

      const { useQueue } = await import("@/utils/bullmq");

      const queue = useQueue("translate-request");

      expect(Queue).toHaveBeenCalledTimes(1);
      expect(Queue).toHaveBeenCalledWith("translate-request", {
        connection: mockConnectionOptions,
        prefix: "@europeana:sea:cats",
      });
      expect(queue).toBe(mockQueueInstance);
    });

    it("caches Queue instances per queue name and creates separate instances for different names", async () => {
      vi.mocked(Queue).mockImplementation(function (name: string) {
        return { name } as Queue;
      });

      const { useQueue } = await import("@/utils/bullmq");

      const firstTranslateQueue = useQueue("translate-request");
      const secondTranslateQueue = useQueue("translate-request");
      const zohoQueue = useQueue("zoho-crm-sync-contact");

      expect(firstTranslateQueue).toBe(secondTranslateQueue);
      expect(firstTranslateQueue).not.toBe(zohoQueue);
      expect(Queue).toHaveBeenCalledTimes(2);
    });
  });

  describe("useFlowProducer", () => {
    it("creates and caches a single FlowProducer instance with queue options", async () => {
      const mockFlowProducerInstance = {
        add: vi.fn(),
      } as unknown as FlowProducer;
      vi.mocked(FlowProducer).mockImplementation(function () {
        return mockFlowProducerInstance;
      });

      const { useFlowProducer } = await import("@/utils/bullmq");

      const first = useFlowProducer();
      const second = useFlowProducer();

      expect(FlowProducer).toHaveBeenCalledTimes(1);
      expect(FlowProducer).toHaveBeenCalledWith({
        connection: mockConnectionOptions,
        prefix: "@europeana:sea:cats",
      });
      expect(first).toBe(mockFlowProducerInstance);
      expect(first).toBe(second);
    });
  });
});
