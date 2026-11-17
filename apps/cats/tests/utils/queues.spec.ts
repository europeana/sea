import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowProducer, Queue } from "bullmq";
import { useRedisConnection } from "@/utils/redis";

vi.mock("@/utils/redis", () => ({
  useRedisConnection: vi.fn(),
}));

describe("@/utils/queues", () => {
  const mockConnection = { status: "ready" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(useRedisConnection).mockReturnValue(
      mockConnection as unknown as ReturnType<typeof useRedisConnection>,
    );
  });

  describe("useQueueOptions", () => {
    it("returns BullMQ options with the shared Redis connection and prefix", async () => {
      const { useQueueOptions } = await import("@/utils/queues");

      const options = useQueueOptions();

      expect(useRedisConnection).toHaveBeenCalledTimes(1);
      expect(options).toEqual({
        connection: mockConnection,
        prefix: "@europeana:sea:cats",
      });
    });
  });

  describe("useQueue", () => {
    it("creates and returns a Queue instance with the given name and queue options", async () => {
      const mockQueueInstance = { name: "translate-request" } as Queue;
      vi.mocked(Queue).mockImplementation(function () {
        return mockQueueInstance;
      });

      const { useQueue } = await import("@/utils/queues");

      const queue = useQueue("translate-request");

      expect(Queue).toHaveBeenCalledTimes(1);
      expect(Queue).toHaveBeenCalledWith("translate-request", {
        connection: mockConnection,
        prefix: "@europeana:sea:cats",
      });
      expect(queue).toBe(mockQueueInstance);
    });

    it("caches Queue instances per queue name and creates separate instances for different names", async () => {
      vi.mocked(Queue).mockImplementation(function (name: string) {
        return { name } as Queue;
      });

      const { useQueue } = await import("@/utils/queues");

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

      const { useFlowProducer } = await import("@/utils/queues");

      const first = useFlowProducer();
      const second = useFlowProducer();

      expect(FlowProducer).toHaveBeenCalledTimes(1);
      expect(FlowProducer).toHaveBeenCalledWith({
        connection: mockConnection,
        prefix: "@europeana:sea:cats",
      });
      expect(first).toBe(mockFlowProducerInstance);
      expect(first).toBe(second);
    });
  });
});
