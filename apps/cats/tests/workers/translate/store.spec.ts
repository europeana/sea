import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useContentfulEnvironment } from "@/utils/contentful";
import { name, processor, opts } from "@/workers/translate/store";

vi.mock("@/utils/contentful", () => ({
  useContentfulEnvironment: vi.fn(),
}));

function createMockJob(
  data: Record<string, unknown> = {},
  childrenValues: Record<string, unknown> = {},
): Job {
  return {
    id: "job-101",
    name,
    data,
    getChildrenValues: vi.fn().mockResolvedValue(childrenValues),
  } as unknown as Job;
}

describe("@/workers/translate/store", () => {
  const mockGetEntry = vi.fn();
  const mockUpdate = vi.fn();
  const mockPublish = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useContentfulEnvironment).mockResolvedValue({
      getEntry: mockGetEntry,
    } as unknown as Awaited<ReturnType<typeof useContentfulEnvironment>>);
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("translate-store");
    expect(opts).toEqual({
      removeOnComplete: { count: 100 },
    });
  });

  it("merges translated child job fields into Contentful entry locales, updates, and publishes", async () => {
    const entry = {
      sys: { id: "entry-1" },
      fields: {
        title: { "en-GB": "Hello Europeana" },
        body: { "en-GB": "Original English body" },
      },
      update: mockUpdate,
      publish: mockPublish,
    };

    const updatedEntry = { ...entry, sys: { id: "entry-1", version: 2 } };
    const publishedEntry = {
      ...updatedEntry,
      sys: { id: "entry-1", version: 3 },
    };

    mockGetEntry.mockResolvedValue(entry);
    mockUpdate.mockResolvedValue(updatedEntry);
    mockPublish.mockResolvedValue(publishedEntry);

    const job = createMockJob(
      { entryId: "entry-1" },
      {
        "bull:translate-receive:translate-receive-job-101-FR": {
          lang: "FR",
          fields: {
            title: "Bonjour Europeana",
            body: "Corps traduit en français",
          },
        },
        "bull:translate-receive:translate-receive-job-101-DE": {
          lang: "DE",
          fields: {
            title: "Hallo Europeana",
            body: "Übersetzter deutscher Text",
          },
        },
      },
    );

    const result = await processor(job);

    expect(mockGetEntry).toHaveBeenCalledWith("entry-1");

    expect(entry.fields).toEqual({
      title: {
        "en-GB": "Hello Europeana",
        "fr-FR": "Bonjour Europeana",
        "de-DE": "Hallo Europeana",
      },
      body: {
        "en-GB": "Original English body",
        "fr-FR": "Corps traduit en français",
        "de-DE": "Übersetzter deutscher Text",
      },
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(result).toBe(publishedEntry);
  });

  it("discards non-translatable fields without an 'en-GB' source locale and ignores unknown fields from children", async () => {
    const entry = {
      sys: { id: "entry-2" },
      fields: {
        title: { "en-GB": "English Title" },
        slug: { "en-US": "non-localized-or-other-locale-slug" },
        internalRef: {},
      },
      update: mockUpdate,
      publish: mockPublish,
    };

    mockGetEntry.mockResolvedValue(entry);
    mockUpdate.mockResolvedValue(entry);
    mockPublish.mockResolvedValue(entry);

    const job = createMockJob(
      { entryId: "entry-2" },
      {
        "bull:translate-receive:translate-receive-job-101-NL": {
          lang: "NL",
          fields: {
            title: "Nederlandse Titel",
            slug: "should-be-ignored",
            nonExistentField: "also-ignored",
          },
        },
      },
    );

    await processor(job);

    expect(entry.fields).toEqual({
      title: {
        "en-GB": "English Title",
        "nl-NL": "Nederlandse Titel",
      },
    });
    expect(entry.fields).not.toHaveProperty("slug");
    expect(entry.fields).not.toHaveProperty("internalRef");
    expect(entry.fields).not.toHaveProperty("nonExistentField");
  });

  it("propagates errors when fetching, updating, or publishing the Contentful entry fails", async () => {
    const entry = {
      sys: { id: "entry-3" },
      fields: {
        title: { "en-GB": "Title" },
      },
      update: mockUpdate,
      publish: mockPublish,
    };

    mockGetEntry.mockResolvedValue(entry);
    mockUpdate.mockRejectedValue(new Error("Contentful version conflict"));

    const job = createMockJob({ entryId: "entry-3" }, {});

    await expect(processor(job)).rejects.toThrow("Contentful version conflict");
    expect(mockPublish).not.toHaveBeenCalled();
  });
});
