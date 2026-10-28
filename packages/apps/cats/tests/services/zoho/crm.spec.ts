import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRuntimeConfig } from "nitropack/runtime";
import { Readable } from "node:stream";

import { createZohoCRMClient } from "@/services/zoho/crm";

const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);
const mockAPI = { request: vi.fn() };

describe("@/services/zoho/crm", () => {
  beforeEach(() => {
    mockUseRuntimeConfig.mockReturnValue({
      zoho: {
        bulkReadCallbackUrl: "https://example.org/zoho/bulk/callback",
      },
    });
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createZohoCRMClient", () => {
    describe("createZohoBulkReadJob", () => {
      const apiResponse = "SUCCESS";
      const criteria = {
        field: { api_name: "Contact_Participation" },
        comparator: "contains",
        value: ["Staff"],
      };

      beforeEach(() => {
        mockAPI.request.mockResolvedValue(
          new Response(JSON.stringify(apiResponse)),
        );
      });

      it("sends a request to Zoho CRM API", async () => {
        await createZohoCRMClient(mockAPI).createZohoBulkReadJob(criteria);

        expect(mockAPI.request).toHaveBeenCalledWith("/crm/bulk/v8/read", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: '{"query":{"module":{"api_name":"Contacts"},"fields":["id","Full_Name","Public_email","LinkedIn","Communities","Contact_Participation","Country_new","Title","Modified_Time"],"criteria":{"field":{"api_name":"Contact_Participation"},"comparator":"contains","value":["Staff"]}},"callback":{"method":"post","url":"https://example.org/zoho/bulk/callback"}}',
        });
      });

      it("returns response", async () => {
        const response =
          await createZohoCRMClient(mockAPI).createZohoBulkReadJob(criteria);

        expect(response).toBe(apiResponse);
      });
    });

    describe("fetchZohoBulkReadJobResult", () => {
      const id = "123456";

      beforeEach(() => {
        const apiResponse = new Response("csv");

        mockAPI.request.mockResolvedValue(apiResponse);
      });

      it("sends a request to Zoho CRM API", async () => {
        await createZohoCRMClient(mockAPI).fetchZohoBulkReadJobResult(id);

        expect(mockAPI.request).toHaveBeenCalledWith(
          "/crm/bulk/v8/read/123456/result",
        );
      });

      it("returns the file", async () => {
        const response =
          await createZohoCRMClient(mockAPI).fetchZohoBulkReadJobResult(id);

        expect(response instanceof Readable).toBe(true);
      });
    });

    describe("fetchZohoContact", () => {
      const id = "123456";
      const contactRecord = { Full_Name: "Test Contact" };
      const apiResponse = { data: [contactRecord] };

      beforeEach(() => {
        mockAPI.request.mockResolvedValue(
          new Response(JSON.stringify(apiResponse)),
        );
      });

      it("sends a request to Zoho CRM API", async () => {
        await createZohoCRMClient(mockAPI).fetchZohoContact(id);

        expect(mockAPI.request).toHaveBeenCalledWith(
          "/crm/v8/Contacts/123456",
          {
            params: {
              fields:
                "id,Full_Name,Public_email,LinkedIn,Communities,Contact_Participation,Country_new,Title",
            },
          },
        );
      });

      it("returns the first data item from the response", async () => {
        const response =
          await createZohoCRMClient(mockAPI).fetchZohoContact(id);

        expect(response).toEqual(contactRecord);
      });
    });

    describe("fetchZohoPhoto", () => {
      const id = "123456";
      const fileName = "123456.jpg";
      const contentType = "image/jpeg";

      beforeEach(() => {
        const apiResponse = new Response("photo", {
          headers: {
            "content-disposition": `attachment; filename="${fileName}"`,
            "content-type": contentType,
          },
        });

        mockAPI.request.mockResolvedValue(apiResponse);
      });

      it("sends a request to Zoho CRM API", async () => {
        await createZohoCRMClient(mockAPI).fetchZohoPhoto(id);

        expect(mockAPI.request).toHaveBeenCalledWith(
          "/crm/v8/Contacts/123456/photo",
        );
      });

      it("returns the photo file, content type and file name", async () => {
        const response = await createZohoCRMClient(mockAPI).fetchZohoPhoto(id);

        expect(response?.file instanceof Readable).toBe(true);
        expect(response?.contentType).toBe(contentType);
        expect(response?.fileName).toBe(fileName);
      });
    });
  });
});
