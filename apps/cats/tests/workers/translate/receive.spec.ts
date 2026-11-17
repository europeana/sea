import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { extractFields } from "@/utils/html/extractFields";
import { name, processor, opts } from "@/workers/translate/receive";

vi.mock("@/utils/html/extractFields", () => ({
  extractFields: vi.fn(),
}));

function createMockJob(data: Record<string, unknown> = {}): Job {
  return {
    id: "translate-receive-job-101-FR",
    name,
    data,
  } as unknown as Job;
}

describe("@/workers/translate/receive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("translate-receive");
    expect(opts).toEqual({
      removeOnComplete: { count: 100 },
    });
  });

  it("extracts translated fields from job data and returns them with the target language", async () => {
    const extractedFields = {
      title: "Bonjour Europeana",
      body: "## Titre\n\nContenu traduit",
      tags: ["Culture", "Patrimoine"],
    };
    vi.mocked(extractFields).mockReturnValue(extractedFields);

    const jobData = {
      contentType: { sys: { id: "page" } },
      lang: "FR",
      html: '<article><section data-ctf-field-id="title">Bonjour Europeana</section></article>',
    };

    const job = createMockJob(jobData);
    const result = await processor(job);

    expect(extractFields).toHaveBeenCalledTimes(1);
    expect(extractFields).toHaveBeenCalledWith(jobData);
    expect(result).toEqual({
      lang: "FR",
      fields: extractedFields,
    });
  });

  it("propagates errors thrown by extractFields (e.g. when html is missing)", async () => {
    vi.mocked(extractFields).mockImplementation(() => {
      throw new TypeError("cheerio.load() expects a string");
    });

    const job = createMockJob({
      contentType: { sys: { id: "page" } },
      lang: "DE",
    });

    await expect(processor(job)).rejects.toThrow(
      "cheerio.load() expects a string",
    );
  });
});
