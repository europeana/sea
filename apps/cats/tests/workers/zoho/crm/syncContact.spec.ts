import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { ZohoContact, type ZohoContactRecord } from "@europeana/zoho-client";
import { createOrUpdateEntry } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";
import { name, processor, opts } from "@/workers/zoho/crm/syncContact";

vi.mock("@/utils/contentful", () => ({
  createOrUpdateEntry: vi.fn(),
}));

vi.mock("@/utils/zoho", () => ({
  useZoho: vi.fn(),
}));

function createMockJob(
  data: Record<string, unknown> = {},
  childrenValues: Record<string, unknown> = {},
): Job {
  return {
    id: "job-1",
    name,
    data,
    getChildrenValues: vi.fn().mockResolvedValue(childrenValues),
  } as unknown as Job;
}

describe("@/workers/zoho/crm/syncContact", () => {
  const mockFetchZohoContact = vi.fn();

  const baseRecord: ZohoContactRecord = {
    id: "zoho-123",
    Full_Name: "Ada Lovelace",
    Public_email: "ada@example.org",
    Contact_Participation: ["Speaker"],
    Title: "Mathematician",
    Country_new: "United Kingdom",
    Communities: ["Tech", "History"],
    LinkedIn: "https://linkedin.com",
    Modified_Time: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRuntimeConfig).mockReturnValue({
      contentful: { defaultLocale: "en-US" },
    } as ReturnType<typeof useRuntimeConfig>);

    vi.mocked(useZoho).mockReturnValue({
      crm: {
        fetchZohoContact: mockFetchZohoContact,
      },
    } as unknown as ReturnType<typeof useZoho>);
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("zoho-crm-sync-contact");
    expect(opts).toEqual({
      removeOnComplete: { count: 0 },
    });
  });

  it("fetches contact from Zoho CRM when contactRecord is not provided", async () => {
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(baseRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    expect(mockFetchZohoContact).toHaveBeenCalledWith("zoho-123");
    expect(createOrUpdateEntry).toHaveBeenCalledWith(
      "person",
      {
        content_type: "person",
        "fields.zohoId": "zoho-123",
      },
      {
        name: { "en-US": "Ada Lovelace" },
        email: { "en-US": "ada@example.org" },
        participation: { "en-US": ["Speaker"] },
        title: { "en-US": "Mathematician" },
        country: { "en-US": "United Kingdom" },
        communities: { "en-US": ["Tech", "History"] },
        url: { "en-US": "https://linkedin.com" },
        zohoId: { "en-US": "zoho-123" },
      },
      true,
    );
    expect(result).toEqual({ entryId: "cf-entry-999" });
  });

  it("uses contactRecord from job data directly without calling Zoho API", async () => {
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob({
      contactId: "zoho-123",
      contactRecord: baseRecord,
    });
    const result = await processor(job);

    expect(mockFetchZohoContact).not.toHaveBeenCalled();
    expect(createOrUpdateEntry).toHaveBeenCalledWith(
      "person",
      {
        content_type: "person",
        "fields.zohoId": "zoho-123",
      },
      expect.objectContaining({
        name: { "en-US": "Ada Lovelace" },
        zohoId: { "en-US": "zoho-123" },
      }),
      true,
    );
    expect(result).toEqual({ entryId: "cf-entry-999" });
  });

  it("attaches image asset link when a zoho-crm-sync-photo child job returns an assetId", async () => {
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(baseRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob(
      { contactId: "zoho-123" },
      {
        "bull:zoho-crm-sync-photo-job:42": { assetId: "asset-777" },
      },
    );

    await processor(job);

    expect(createOrUpdateEntry).toHaveBeenCalledWith(
      "person",
      expect.any(Object),
      expect.objectContaining({
        image: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: "asset-777",
            },
          },
        },
      }),
      true,
    );
  });

  it("ignores child jobs if photo job key is missing or has no assetId", async () => {
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(baseRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob(
      { contactId: "zoho-123" },
      {
        "bull:zoho-crm-sync-photo-job:42": {},
      },
    );

    await processor(job);

    const passedFields = vi.mocked(createOrUpdateEntry).mock.calls[0][2];
    expect(passedFields).not.toHaveProperty("image");
  });

  it('normalizes malformed "TÃ¼rkiye" country string to "Türkiye"', async () => {
    const turkishRecord: ZohoContactRecord = {
      ...baseRecord,
      Country_new: "TÃ¼rkiye",
    };
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(turkishRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob({ contactId: "zoho-123" });
    await processor(job);

    expect(createOrUpdateEntry).toHaveBeenCalledWith(
      "person",
      expect.any(Object),
      expect.objectContaining({
        country: { "en-US": "Türkiye" },
      }),
      true,
    );
  });

  it("returns { entryId: null } when createOrUpdateEntry returns null", async () => {
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(baseRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue(null as never);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    expect(result).toEqual({ entryId: null });
  });

  it("throws an error when Zoho contact cannot be found", async () => {
    mockFetchZohoContact.mockResolvedValue(null);

    const job = createMockJob({ contactId: "missing-id" });

    await expect(processor(job)).rejects.toThrow(
      'No Zoho contact for ID "missing-id',
    );
    expect(createOrUpdateEntry).not.toHaveBeenCalled();
  });
});
