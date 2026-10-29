import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useZoho } from "@/utils/zoho";
import { processor } from "@/workers/zoho/crm/createBulkRead";

vi.mock("@/utils/zoho", () => ({
  useZoho: vi.fn(),
}));

const mockUseZoho = vi.mocked(useZoho);
const mockCreateZohoBulkReadJob = vi.fn();

describe("@/workers/zoho/crm/createBulkRead", () => {
  const zohoBulkReadJobId = "789";
  const criteria = {
    field: { api_name: "Contact_Participation" },
    comparator: "contains",
    value: ["Staff"],
  };
  const job = { data: { criteria } };

  beforeEach(() => {
    mockUseZoho.mockReturnValue({
      crm: {
        createZohoBulkReadJob: mockCreateZohoBulkReadJob,
      },
    });
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("processor", () => {
    beforeEach(() => {
      mockCreateZohoBulkReadJob.mockResolvedValue({
        data: [{ details: { id: zohoBulkReadJobId } }],
      });
    });

    it("calls Zoho CRM API to create a bulk read job with criteria from data", async () => {
      await processor(job);

      expect(mockCreateZohoBulkReadJob).toHaveBeenCalledWith(criteria);
    });

    it("returns the Zoho CRM bulk read job ID", async () => {
      const response = await processor(job);

      expect(response).toEqual({ zohoBulkReadJobId });
    });
  });
});
