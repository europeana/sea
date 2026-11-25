import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { ZohoContact, type ZohoContactRecord } from "@europeana/zoho-client";
import { createOrUpdateEntry } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";
import { processor, opts } from "@/workers/zoho/crm/syncContact";

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
    data,
    getChildrenValues: vi.fn().mockResolvedValue(childrenValues),
  } as unknown as Job;
}

describe("@/workers/zoho/crm/syncContact", () => {
  const mockFetchZohoContact = vi.fn();
  const locale = "en-GB";

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
    Europeana_Initiative_role_chair: [],
    Europeana_Initiative_role_member: [],
    Europeana_Initiative_role_vice_chair: [],
    Europeana_Initiative_role_treasurer: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRuntimeConfig).mockReturnValue({
      contentful: { defaultLocale: "en-GB" },
    } as ReturnType<typeof useRuntimeConfig>);

    vi.mocked(useZoho).mockReturnValue({
      crm: {
        fetchZohoContact: mockFetchZohoContact,
      },
    } as unknown as ReturnType<typeof useZoho>);
  });

  it("exports expected worker options", () => {
    expect(opts).toEqual({});
  });

  it("fetches contact from Zoho CRM when contactRecord is not provided", async () => {
    mockFetchZohoContact.mockResolvedValue(new ZohoContact(baseRecord));
    vi.mocked(createOrUpdateEntry).mockResolvedValue({
      sys: { id: "cf-entry-999" },
    } as never);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    expect(mockFetchZohoContact).toHaveBeenCalledWith(
      "zoho-123",
      "id,Full_Name,Public_email,LinkedIn,Communities,Contact_Participation,Country_new,Title,Europeana_Initiative_role_chair,Europeana_Initiative_role_vice_chair,Europeana_Initiative_role_treasurer,Europeana_Initiative_role_member",
    );
    expect(createOrUpdateEntry).toHaveBeenCalledWith(
      {
        contentTypeId: "zohoContact",
        entryId: `zohoContact-zoho-123`,
      },
      {
        content_type: "zohoContact",
        "fields.identifier": "zoho-123",
      },
      {
        fields: {
          name: { [locale]: "Ada Lovelace" },
          email: { [locale]: "ada@example.org" },
          participation: { [locale]: ["Speaker"] },
          title: { [locale]: "Mathematician" },
          country: { [locale]: "United Kingdom" },
          communities: { [locale]: ["Tech", "History"] },
          linkedInUrl: { [locale]: "https://linkedin.com" },
          roleChair: { [locale]: [] },
          roleMember: { [locale]: [] },
          roleTreasurer: { [locale]: [] },
          roleViceChair: { [locale]: [] },
          identifier: { [locale]: "zoho-123" },
        },
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
      {
        contentTypeId: "zohoContact",
        entryId: `zohoContact-zoho-123`,
      },
      {
        content_type: "zohoContact",
        "fields.identifier": "zoho-123",
      },
      {
        fields: expect.objectContaining({
          name: { [locale]: "Ada Lovelace" },
          identifier: { [locale]: "zoho-123" },
        }),
      },
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
      {
        contentTypeId: "zohoContact",
        entryId: `zohoContact-zoho-123`,
      },
      expect.any(Object),
      {
        fields: expect.objectContaining({
          image: {
            [locale]: {
              sys: {
                type: "Link",
                linkType: "Asset",
                id: "asset-777",
              },
            },
          },
        }),
      },
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
