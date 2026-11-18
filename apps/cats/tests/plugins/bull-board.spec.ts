import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { H3Adapter } from "@bull-board/h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NitroApp } from "nitropack";

import bullBoardPlugin from "@/plugins/bull-board";
import queues from "@/queues/index";
import { useQueue } from "@/utils/bullmq";

vi.mock("@/queues/index", () => ({
  default: [{ name: "test-queue-1" }, { name: "test-queue-2" }],
}));

vi.mock("@/utils/bullmq", () => ({
  useQueue: vi.fn((name: string) => ({ name, mockQueueInstance: true })),
}));

const mockHandler = vi.fn();
const mockSetBasePath = vi.fn();
const mockRegisterHandlers = vi.fn(() => ({ handler: mockHandler }));

vi.mock("@bull-board/h3", () => ({
  H3Adapter: vi.fn(
    class {
      setBasePath = mockSetBasePath;
      registerHandlers = mockRegisterHandlers;
    },
  ),
}));

vi.mock("@bull-board/api/bullMQAdapter", () => ({
  BullMQAdapter: vi.fn(
    class {
      isBullMQAdapter = true;
      constructor(public queue: unknown) {}
    },
  ),
}));

vi.mock("@bull-board/api", () => ({
  createBullBoard: vi.fn(),
}));

describe("@/plugins/bull-board", () => {
  let mockNitroApp: { router: { use: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    mockNitroApp = {
      router: {
        use: vi.fn(),
      },
    };

    bullBoardPlugin(mockNitroApp as unknown as NitroApp);
  });

  it("initializes H3Adapter with the /admin base path", () => {
    expect(H3Adapter).toHaveBeenCalledOnce();
    expect(mockSetBasePath).toHaveBeenCalledWith("/admin");
  });

  it("resolves all configured queues and wraps them in BullMQAdapter", () => {
    expect(useQueue).toHaveBeenCalledTimes(queues.length);
    expect(useQueue).toHaveBeenNthCalledWith(1, "test-queue-1");
    expect(useQueue).toHaveBeenNthCalledWith(2, "test-queue-2");
    expect(BullMQAdapter).toHaveBeenCalledTimes(queues.length);
  });

  it("creates the Bull Board instance with the queue adapters and server adapter", () => {
    expect(createBullBoard).toHaveBeenCalledOnce();
    expect(createBullBoard).toHaveBeenCalledWith({
      queues: [
        expect.objectContaining({
          queue: { name: "test-queue-1", mockQueueInstance: true },
          isBullMQAdapter: true,
        }),
        expect.objectContaining({
          queue: { name: "test-queue-2", mockQueueInstance: true },
          isBullMQAdapter: true,
        }),
      ],
      serverAdapter: expect.any(H3Adapter),
    });
  });

  it("mounts the H3 handler on both /admin and /admin/**", () => {
    expect(mockRegisterHandlers).toHaveBeenCalledOnce();
    expect(mockNitroApp.router.use).toHaveBeenCalledTimes(2);
    expect(mockNitroApp.router.use).toHaveBeenNthCalledWith(
      1,
      "/admin",
      mockHandler,
    );
    expect(mockNitroApp.router.use).toHaveBeenNthCalledWith(
      2,
      "/admin/**",
      mockHandler,
    );
  });
});
