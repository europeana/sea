import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useContentfulEnvironment } from "@/utils/contentful";
import { useFlowProducer } from "@/utils/queues";
import { markupFields } from "@/utils/html/markupFields";
import { requestTranslation } from "@/services/eTranslation";
import { name, processor, opts } from "@/workers/translate/request";

vi.mock("@/utils/contentful", () => ({
  useContentfulEnvironment: vi.fn(),
}));

vi.mock("@/utils/i18n/locales", () => ({
  supportedLocales: ["fr-FR", "de-DE", "nl-NL"],
}));

vi.mock("@/utils/queues", () => ({
  useFlowProducer: vi.fn(),
}));

vi.mock("@/utils/html/markupFields", () => ({
  markupFields: vi.fn(),
}));

vi.mock("@/services/eTranslation", () => ({
  requestTranslation: vi.fn(),
}));

vi.mock("@/workers/translate/receive", () => ({
  name: "translate-receive",
}));

vi.mock("@/workers/translate/store", () => ({
  name: "translate-store",
}));

function createMockJob(data: Record<string, unknown> = {}): Job {
  const job = {
    id: "job-101",
    name,
    data: { ...data },
    updateData: vi.fn(async (nextData: Record<string, unknown>) => {
      job.data = nextData;
    }),
  };
  return job as unknown as Job;
}

describe("@/workers/translate/request", () => {
  const mockGetContentType = vi.fn();
  const mockFlowProducerAdd = vi.fn();

  const mockContentType = {
    sys: { id: "page" },
    fields: [{ id: "title", localized: true }],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useContentfulEnvironment).mockResolvedValue({
      getContentType: mockGetContentType,
    } as unknown as Awaited<ReturnType<typeof useContentfulEnvironment>>);

    vi.mocked(useFlowProducer).mockReturnValue({
      add: mockFlowProducerAdd.mockResolvedValue({}),
    } as unknown as ReturnType<typeof useFlowProducer>);

    mockGetContentType.mockResolvedValue(mockContentType);
    vi.mocked(markupFields).mockReturnValue(
      "<div data-field='title'>Hello</div>",
    );
    vi.mocked(requestTranslation).mockResolvedValue({ requestId: 98765 });
  });

  it("exports expected worker metadata, options, and rate limiter", () => {
    expect(name).toBe("translate-request");
    expect(opts).toEqual({
      removeOnComplete: { count: 100 },
      limiter: {
        max: 10,
        duration: 60_000,
      },
    });
  });

  it("returns early without side effects when entry has no translation tags or no metadata", async () => {
    const jobWithoutTranslationTags = createMockJob({
      entry: {
        sys: { id: "entry-1", contentType: { sys: { id: "page" } } },
        metadata: { tags: [{ sys: { id: "unrelated-tag" } }] },
      },
    });

    const jobWithoutMetadata = createMockJob({
      entry: {
        sys: { id: "entry-2", contentType: { sys: { id: "page" } } },
      },
    });

    await expect(processor(jobWithoutTranslationTags)).resolves.toBeUndefined();
    await expect(processor(jobWithoutMetadata)).resolves.toBeUndefined();

    expect(mockGetContentType).not.toHaveBeenCalled();
    expect(markupFields).not.toHaveBeenCalled();
    expect(mockFlowProducerAdd).not.toHaveBeenCalled();
    expect(requestTranslation).not.toHaveBeenCalled();
  });

  it("translates to all supported locales when entry has the global 'translate' tag", async () => {
    const job = createMockJob({
      entry: {
        sys: { id: "entry-1", contentType: { sys: { id: "page" } } },
        metadata: { tags: [{ sys: { id: "translate" } }] },
      },
    });

    const result = await processor(job);

    expect(result).toEqual(["FR", "DE", "NL"]);
    expect(mockGetContentType).toHaveBeenCalledWith("page");
    expect(markupFields).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: mockContentType }),
    );

    expect(mockFlowProducerAdd).toHaveBeenCalledWith({
      queueName: "translate-store",
      name: "translation",
      data: { entryId: "entry-1" },
      opts: {
        jobId: "job-101",
        attempts: 5,
        backoff: {
          type: "fixed",
          delay: 10_000,
        },
      },
      children: [
        {
          queueName: "translate-receive",
          name: "translation",
          data: { contentType: mockContentType, lang: "FR" },
          opts: {
            jobId: "translate-receive-job-101-FR",
            attempts: 5,
            backoff: { type: "fixed", delay: 10_000 },
            delay: 86_400_000,
          },
        },
        {
          queueName: "translate-receive",
          name: "translation",
          data: { contentType: mockContentType, lang: "DE" },
          opts: {
            jobId: "translate-receive-job-101-DE",
            attempts: 5,
            backoff: { type: "fixed", delay: 10_000 },
            delay: 86_400_000,
          },
        },
        {
          queueName: "translate-receive",
          name: "translation",
          data: { contentType: mockContentType, lang: "NL" },
          opts: {
            jobId: "translate-receive-job-101-NL",
            attempts: 5,
            backoff: { type: "fixed", delay: 10_000 },
            delay: 86_400_000,
          },
        },
      ],
    });

    expect(requestTranslation).toHaveBeenCalledWith({
      externalReference: "job-101",
      html: "<div data-field='title'>Hello</div>",
      targetLanguages: ["FR", "DE", "NL"],
    });

    expect(job.updateData).toHaveBeenCalledTimes(3);
    expect(job.data.eTranslationRequestId).toBe(98765);
  });

  it("filters specific 'translate.<locale>' tags against supportedLocales", async () => {
    const job = createMockJob({
      entry: {
        sys: { id: "entry-2", contentType: { sys: { id: "page" } } },
        metadata: {
          tags: [
            { sys: { id: "translate.fr-FR" } },
            { sys: { id: "translate.unsupported-XX" } },
            { sys: { id: "translate.de-DE" } },
          ],
        },
      },
    });

    const result = await processor(job);

    expect(result).toEqual(["FR", "DE"]);
    expect(requestTranslation).toHaveBeenCalledWith(
      expect.objectContaining({
        targetLanguages: ["FR", "DE"],
      }),
    );
  });

  it("skips fetching contentType, generating html, and calling requestTranslation when already cached in job.data", async () => {
    const job = createMockJob({
      entry: {
        sys: { id: "entry-3", contentType: { sys: { id: "page" } } },
        metadata: { tags: [{ sys: { id: "translate.nl-NL" } }] },
      },
      contentType: mockContentType,
      html: "<p>Cached HTML</p>",
      eTranslationRequestId: 55555,
    });

    const result = await processor(job);

    expect(result).toEqual(["NL"]);
    expect(mockGetContentType).not.toHaveBeenCalled();
    expect(markupFields).not.toHaveBeenCalled();
    expect(requestTranslation).not.toHaveBeenCalled();
    expect(job.updateData).not.toHaveBeenCalled();
    expect(mockFlowProducerAdd).toHaveBeenCalledTimes(1);
  });
});
