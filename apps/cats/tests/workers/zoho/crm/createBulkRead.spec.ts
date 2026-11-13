import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import type { ZohoBulkReadCriteria } from "@europeana/zoho-client";
import { useZoho } from "@/utils/zoho";
import { name, processor, opts } from "@/workers/zoho/crm/createBulkRead";

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn(),
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

describe("@/workers/zoho/crm/createBulkRead", () => {
  const mockCreateZohoBulkReadJob = vi.fn();

  const sampleCriteria: ZohoBulkReadCriteria = {
    group_operator: "and",
    group: [
      {
        field: { api_name: "Modified_Time" },
        comparator: "greater_than",
        value: "2026-01-01T00:00:00Z",
      },
    ],
  } as unknown as ZohoBulkReadCriteria;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRuntimeConfig).mockReturnValue({
      zoho: {
        bulkReadCallbackUrl: "https://example.org",
      },
    } as ReturnType<typeof useRuntimeConfig>);

    vi.mocked(useZoho).mockReturnValue({
      crm: {
        createZohoBulkReadJob: mockCreateZohoBulkReadJob,
      },
    } as unknown as ReturnType<typeof useZoho>);
  });

  it("exports expected worker metadata and options", () => {
    expect(name).toBe("zoho-crm-create-bulk-read");
    expect(opts).toEqual({
      removeOnComplete: { count: 0 },
    });
  });

  it("creates a Zoho bulk read job with criteria and callback URL and returns the job ID", async () => {
    mockCreateZohoBulkReadJob.mockResolvedValue({
      data: [
        {
          status: "success",
          code: "ADDED_SUCCESSFULLY",
          details: {
            id: "bulk-job-456",
          },
        },
      ],
    });

    const job = createMockJob({ criteria: sampleCriteria });
    const result = await processor(job);

    expect(mockCreateZohoBulkReadJob).toHaveBeenCalledWith(
      sampleCriteria,
      "https://example.org",
    );
    expect(result).toEqual({ zohoBulkReadJobId: "bulk-job-456" });
  });

  it("passes undefined for callback URL and criteria when omitted", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue(
      {} as ReturnType<typeof useRuntimeConfig>,
    );

    mockCreateZohoBulkReadJob.mockResolvedValue({
      data: [
        {
          details: {
            id: "bulk-job-789",
          },
        },
      ],
    });

    const job = createMockJob();
    const result = await processor(job);

    expect(mockCreateZohoBulkReadJob).toHaveBeenCalledWith(
      undefined,
      undefined,
    );
    expect(result).toEqual({ zohoBulkReadJobId: "bulk-job-789" });
  });

  it("propagates errors thrown by createZohoBulkReadJob", async () => {
    mockCreateZohoBulkReadJob.mockRejectedValue(
      new Error("Zoho API authentication failed"),
    );

    const job = createMockJob({ criteria: sampleCriteria });

    await expect(processor(job)).rejects.toThrow(
      "Zoho API authentication failed",
    );
  });

  it("throws when Zoho returns an unexpected response shape without details.id", async () => {
    mockCreateZohoBulkReadJob.mockResolvedValue({
      data: [],
    });

    const job = createMockJob({ criteria: sampleCriteria });

    await expect(processor(job)).rejects.toThrow();
  });
});
