import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { H3Event, getRequestHeader, readBody } from "h3";

import { useQueue } from "@/utils/queues";
import routeHandler from "@/routes/translate/ctf.post";

vi.mock("@/utils/queues", () => ({
  useQueue: vi.fn(),
}));

const mockUseQueue = vi.mocked(useQueue);
const mockReadBody = vi.mocked(readBody);
const mockGetRequestHeader = vi.mocked(getRequestHeader);

describe("@/routes/translate/ctf.post", () => {
  const mockQueueAdd = vi.fn();

  beforeEach(() => {
    mockUseQueue.mockReturnValue({
      add: mockQueueAdd.mockResolvedValue({}),
    } as unknown as ReturnType<typeof useQueue>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("route handler", () => {
    const mockEntry = {
      sys: { id: "entry-123" },
      fields: { name: { "en-GB": "About Europeana" } },
    };
    const idempotencyKey = "ctf-idem-key-987";

    beforeEach(() => {
      mockReadBody.mockResolvedValue(mockEntry);
      mockGetRequestHeader.mockReturnValue(idempotencyKey);
    });

    it("reads X-Contentful-Idempotency-Key header from the event", async () => {
      const event = {} as H3Event;
      await routeHandler(event);

      expect(mockGetRequestHeader).toHaveBeenCalledWith(
        event,
        "X-Contentful-Idempotency-Key",
      );
    });

    it("queues a translate-request job with derived jobId and retry options", async () => {
      await routeHandler({} as H3Event);

      expect(mockUseQueue).toHaveBeenCalledWith("translate-request");
      expect(mockQueueAdd).toHaveBeenCalledWith(
        "translation",
        { entry: mockEntry },
        {
          jobId: "translate-request-ctf-idem-key-987",
          attempts: 5,
          backoff: {
            type: "fixed",
            delay: 60_000,
          },
        },
      );
    });

    it("returns the derived jobId", async () => {
      const response = await routeHandler({} as H3Event);

      expect(response).toEqual({
        jobId: "translate-request-ctf-idem-key-987",
      });
    });
  });
});
