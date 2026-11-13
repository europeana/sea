import { describe, expect, it } from "vitest";
import { ZohoContactRecord } from "@europeana/zoho-client";

import { createSyncContactFlow } from "@/flows/zoho";

describe("@/flows/zoho", () => {
  describe("createSyncContactFlow", () => {
    it("builds a BullMQ flow with contact sync parent and photo sync child", () => {
      const flow = createSyncContactFlow({
        contactId: "486281000001030363",
        modified: "1792656233000",
      });

      expect(flow.queueName).toBe("zoho-crm-sync-contact");
      expect(flow.name).toBe("sync-contact");
      expect(flow.data).toEqual({
        contactId: "486281000001030363",
        contactRecord: undefined,
      });
      expect(flow.opts?.jobId).toBe(
        "zoho-crm-sync-contact-486281000001030363-1792656233000",
      );

      expect(flow.children).toHaveLength(1);
      const child = flow.children![0];
      expect(child.queueName).toBe("zoho-crm-sync-photo");
      expect(child.name).toBe("sync-photo");
      expect(child.data).toEqual({
        contactId: "486281000001030363",
      });
      expect(child.opts?.jobId).toBe(
        "zoho-crm-sync-photo-486281000001030363-1792656233000",
      );
    });

    it("includes contactRecord in parent job data when provided", () => {
      const mockRecord = {
        id: "486281000001030363",
        Full_Name: "Ada Lovelace",
      } as ZohoContactRecord;

      const flow = createSyncContactFlow({
        contactId: "486281000001030363",
        modified: 1792656233000,
        record: mockRecord,
      });

      expect(flow.data.contactRecord).toEqual(mockRecord);
    });
  });
});
