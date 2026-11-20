import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { extractFields } from "@/utils/html/extractFields";
import { processor, opts } from "@/workers/translate/receive";

vi.mock("@/utils/html/extractFields", () => ({
  extractFields: vi.fn(),
}));

function createMockJob(data: Record<string, unknown> = {}): Job {
  return {
    id: "translate-receive-job-101-FR",
    data,
  } as unknown as Job;
}

describe("@/workers/translate/receive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports expected worker options", () => {
    expect(opts).toEqual({});
  });

  it("extracts translated fields from job data and returns them with the target language", () => {
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
    const result = processor(job);

    expect(extractFields).toHaveBeenCalledTimes(1);
    expect(extractFields).toHaveBeenCalledWith(jobData);
    expect(result).toEqual({
      lang: "FR",
      fields: extractedFields,
    });
  });
});
