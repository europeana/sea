import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { useContentfulEnvironment } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";
import { name, processor, opts } from "@/workers/zoho/crm/syncPhoto";

vi.mock("@/utils/contentful", () => ({
  useContentfulEnvironment: vi.fn(),
}));

vi.mock("@/utils/zoho", () => ({
  useZoho: vi.fn(),
}));

function createMockJob(data: Record<string, unknown> = {}): Job {
  return {
    id: "job-1",
    name,
    data,
  } as unknown as Job;
}

describe("@/workers/zoho/crm/syncPhoto", () => {
  const mockFetchZohoPhoto = vi.fn();
  const mockCreateUpload = vi.fn();
  const mockGetAsset = vi.fn();
  const mockCreateAssetWithId = vi.fn();
  const mockUpdate = vi.fn();
  const mockProcessForAllLocales = vi.fn();
  const mockPublish = vi.fn();

  const mockPhoto = {
    file: Buffer.from("fake-image-bytes"),
    contentType: "image/jpeg",
    fileName: "ada.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRuntimeConfig).mockReturnValue({
      contentful: { defaultLocale: "en-US" },
    } as ReturnType<typeof useRuntimeConfig>);

    vi.mocked(useZoho).mockReturnValue({
      crm: {
        fetchZohoPhoto: mockFetchZohoPhoto,
      },
    } as unknown as ReturnType<typeof useZoho>);

    vi.mocked(useContentfulEnvironment).mockResolvedValue({
      createUpload: mockCreateUpload,
      getAsset: mockGetAsset,
      createAssetWithId: mockCreateAssetWithId,
    } as unknown as Awaited<ReturnType<typeof useContentfulEnvironment>>);

    mockCreateUpload.mockResolvedValue({
      sys: { id: "upload-111" },
    });

    const processedAsset = {
      sys: { id: "zoho-contact-photo-zoho-123" },
      publish: mockPublish.mockResolvedValue(undefined),
    };

    mockProcessForAllLocales.mockResolvedValue(processedAsset);
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("zoho-crm-sync-photo");
    expect(opts).toEqual({
      removeOnComplete: { count: 0 },
    });
  });

  it("returns { assetId: null } when no Zoho photo exists for the contact", async () => {
    mockFetchZohoPhoto.mockResolvedValue(null);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    expect(mockFetchZohoPhoto).toHaveBeenCalledWith("zoho-123");
    expect(useContentfulEnvironment).not.toHaveBeenCalled();
    expect(result).toEqual({ assetId: null });
  });

  it("updates, processes, and publishes an existing Contentful asset", async () => {
    mockFetchZohoPhoto.mockResolvedValue(mockPhoto);

    const existingAsset = {
      sys: { id: "zoho-contact-photo-zoho-123" },
      fields: {},
      update: mockUpdate.mockResolvedValue(undefined),
      processForAllLocales: mockProcessForAllLocales,
    };
    mockGetAsset.mockResolvedValue(existingAsset);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    const expectedFields = {
      title: {
        "en-US": "Zoho CRM Contact photo: zoho-123",
      },
      description: {
        "en-US": "",
      },
      file: {
        "en-US": {
          contentType: "image/jpeg",
          fileName: "ada.jpg",
          uploadFrom: {
            sys: {
              type: "Link",
              linkType: "Upload",
              id: "upload-111",
            },
          },
        },
      },
    };

    expect(mockCreateUpload).toHaveBeenCalledWith({ file: mockPhoto.file });
    expect(mockGetAsset).toHaveBeenCalledWith("zoho-contact-photo-zoho-123");
    expect(existingAsset.fields).toEqual(expectedFields);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreateAssetWithId).not.toHaveBeenCalled();
    expect(mockProcessForAllLocales).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ assetId: "zoho-contact-photo-zoho-123" });
  });

  it("creates a new Contentful asset when getAsset throws a NotFound error", async () => {
    mockFetchZohoPhoto.mockResolvedValue(mockPhoto);

    const notFoundError = new Error("Asset could not be found");
    notFoundError.name = "NotFound";
    mockGetAsset.mockRejectedValue(notFoundError);

    const createdAsset = {
      sys: { id: "zoho-contact-photo-zoho-123" },
      processForAllLocales: mockProcessForAllLocales,
    };
    mockCreateAssetWithId.mockResolvedValue(createdAsset);

    const job = createMockJob({ contactId: "zoho-123" });
    const result = await processor(job);

    expect(mockCreateAssetWithId).toHaveBeenCalledWith(
      "zoho-contact-photo-zoho-123",
      {
        fields: {
          title: {
            "en-US": "Zoho CRM Contact photo: zoho-123",
          },
          description: {
            "en-US": "",
          },
          file: {
            "en-US": {
              contentType: "image/jpeg",
              fileName: "ada.jpg",
              uploadFrom: {
                sys: {
                  type: "Link",
                  linkType: "Upload",
                  id: "upload-111",
                },
              },
            },
          },
        },
      },
    );
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockProcessForAllLocales).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ assetId: "zoho-contact-photo-zoho-123" });
  });

  it("rethrows unexpected errors from getAsset", async () => {
    mockFetchZohoPhoto.mockResolvedValue(mockPhoto);

    const rateLimitError = new Error("Rate limit exceeded");
    rateLimitError.name = "RateLimitExceeded";
    mockGetAsset.mockRejectedValue(rateLimitError);

    const job = createMockJob({ contactId: "zoho-123" });

    await expect(processor(job)).rejects.toThrow("Rate limit exceeded");
    expect(mockCreateAssetWithId).not.toHaveBeenCalled();
    expect(mockProcessForAllLocales).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
  });
});
