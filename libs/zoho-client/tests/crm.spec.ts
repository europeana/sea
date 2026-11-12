import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Readable } from "node:stream";

import { ZohoContact } from "../src/models/crm/contact.js";
import { createZohoCRMClient } from "../src/crm.js";

// const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);
const mockAPI = { request: vi.fn() };

describe("crm", () => {
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
        const callbackUrl = "https://example.org/zoho/bulk/callback";

        await createZohoCRMClient(mockAPI).createZohoBulkReadJob(
          criteria,
          callbackUrl,
        );

        expect(mockAPI.request).toHaveBeenCalledWith("/crm/bulk/v8/read", {
          method: "post",
          headers: new Headers({
            "content-type": "application/json",
          }),
          body: '{"query":{"module":{"api_name":"Contacts"},"fields":["id","Full_Name","Public_email","LinkedIn","Communities","Contact_Participation","Country_new","Title","Modified_Time"],"criteria":{"field":{"api_name":"Contact_Participation"},"comparator":"contains","value":["Staff"]}},"callback":{"method":"post","url":"https://example.org/zoho/bulk/callback"}}',
        });
      });

      describe("when there is a response body", () => {
        it("returns the API response", async () => {
          const response =
            await createZohoCRMClient(mockAPI).createZohoBulkReadJob(criteria);

          expect(response).toBe(apiResponse);
        });
      });

      describe("when there is no response body", () => {
        beforeEach(() => {
          const apiResponse = new Response(null);

          mockAPI.request.mockResolvedValue(apiResponse);
        });

        it("returns null", async () => {
          const response =
            await createZohoCRMClient(mockAPI).createZohoBulkReadJob(criteria);

          expect(response).toBeNull();
        });
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

      describe("when there is a response body", () => {
        it("returns the file as a readable stream", async () => {
          const response =
            await createZohoCRMClient(mockAPI).fetchZohoBulkReadJobResult(id);

          expect(response).toBeInstanceOf(Readable);
        });
      });

      describe("when there is no response body", () => {
        beforeEach(() => {
          const apiResponse = new Response(null);

          mockAPI.request.mockResolvedValue(apiResponse);
        });

        it("returns null", async () => {
          const response =
            await createZohoCRMClient(mockAPI).fetchZohoBulkReadJobResult(id);

          expect(response).toBeNull();
        });
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

      describe("when there is a response body", () => {
        it("returns the first data item from the response", async () => {
          const contact: ZohoContact = {
            record: {
              Full_Name: "Test Contact",
            },
          };

          const response =
            await createZohoCRMClient(mockAPI).fetchZohoContact(id);

          expect(response).toEqual(contact);
        });
      });

      describe("when there is no response body", () => {
        beforeEach(() => {
          const apiResponse = new Response(null);

          mockAPI.request.mockResolvedValue(apiResponse);
        });

        it("returns null", async () => {
          const response =
            await createZohoCRMClient(mockAPI).fetchZohoContact(id);

          expect(response).toBeNull();
        });
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

      describe("when there is a response body", () => {
        it("returns the photo file, content type and file name", async () => {
          const response =
            await createZohoCRMClient(mockAPI).fetchZohoPhoto(id);

          expect(response?.file).toBeInstanceOf(Readable);
          expect(response?.contentType).toBe(contentType);
          expect(response?.fileName).toBe(fileName);
        });
      });

      describe("when there is no response body", () => {
        beforeEach(() => {
          const apiResponse = new Response(null);

          mockAPI.request.mockResolvedValue(apiResponse);
        });

        it("returns null", async () => {
          const response =
            await createZohoCRMClient(mockAPI).fetchZohoPhoto(id);

          expect(response).toBeNull();
        });
      });
    });
  });
});
