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
import { H3Event, readBody } from "h3";

import routeHandler from "@/routes/translate/etr.post";

const mockQueue = vi.mocked(Queue);
const mockReadBody = vi.mocked(readBody);

describe("@/routes/translate/etr.post", () => {
  const mockGetJob = vi.fn();

  beforeEach(() => {
    mockQueue.mockImplementation(
      class {
        getJob = mockGetJob;
      } as unknown as typeof Queue,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("route handler", () => {
    const decodedHtml =
      "<html><body><article><section>Bonjour</section></article></body></html>";
    const encodedResult = Buffer.from(decodedHtml, "utf8").toString("base64");
    const mockWebhookBody = {
      externalReference: "translate-request-ctf-idem-key-987",
      targetLanguage: "FR",
      result: encodedResult,
    };

    beforeEach(() => {
      mockReadBody.mockResolvedValue(mockWebhookBody);
    });

    describe("when matching receive job exists", () => {
      const mockUpdateData = vi.fn().mockResolvedValue(undefined);
      const mockIsDelayed = vi.fn();
      const mockChangeDelay = vi.fn().mockResolvedValue(undefined);

      beforeEach(() => {
        mockGetJob.mockResolvedValue({
          data: {
            lang: "FR",
            contentType: { sys: { id: "page" } },
          },
          updateData: mockUpdateData,
          isDelayed: mockIsDelayed,
          changeDelay: mockChangeDelay,
        });
      });

      it("looks up the job using externalReference and targetLanguage", async () => {
        await routeHandler({} as H3Event);

        expect(mockQueue).toHaveBeenCalledWith(
          "translate-receive",
          expect.any(Object),
        );
        expect(mockGetJob).toHaveBeenCalledWith(
          "translate-receive-translate-request-ctf-idem-key-987-FR",
        );
      });

      it("decodes base64 result and merges html into existing job data", async () => {
        mockIsDelayed.mockResolvedValue(false);

        await routeHandler({} as H3Event);

        expect(mockUpdateData).toHaveBeenCalledWith({
          lang: "FR",
          contentType: { sys: { id: "page" } },
          html: decodedHtml,
        });
      });

      it("sets delay to 0 when the job is currently delayed", async () => {
        mockIsDelayed.mockResolvedValue(true);

        await routeHandler({} as H3Event);

        expect(mockChangeDelay).toHaveBeenCalledWith(0);
      });

      it("does not call changeDelay when the job is not delayed", async () => {
        mockIsDelayed.mockResolvedValue(false);

        await routeHandler({} as H3Event);

        expect(mockChangeDelay).not.toHaveBeenCalled();
      });

      it("returns the receive jobId", async () => {
        mockIsDelayed.mockResolvedValue(true);

        const response = await routeHandler({} as H3Event);

        expect(response).toEqual({
          jobId: "translate-receive-translate-request-ctf-idem-key-987-FR",
        });
      });
    });

    describe("when matching receive job is not found", () => {
      beforeEach(() => {
        mockGetJob.mockResolvedValue(null);
      });

      it("throws a Job not found error", async () => {
        await expect(routeHandler({} as H3Event)).rejects.toThrow(
          "Job not found: translate-receive-translate-request-ctf-idem-key-987-FR",
        );
      });
    });
  });
});
