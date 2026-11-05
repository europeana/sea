import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createZohoAccessToken } from "../src/auth.js";
import { ZohoAuthConfig } from "../src/types.js";

const mockFetch = vi.mocked(global.fetch);

describe("@/services/zoho/auth", () => {
  const oauthResponse = {
    access_token: "ZOHO_ACCESS_TOKEN",
  };
  const config: ZohoAuthConfig = {
    clientId: "ZOHO_CLIENT_ID",
    clientSecret: "ZOHO_CLIENT_SECRET",
    serviceOrgId: "ZOHO_SERVICE_ORG_ID",
  };

  beforeEach(() => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(oauthResponse)));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createZohoAccessToken", () => {
    it("sends a POST request to Zoho oAuth service", async () => {
      const url = new URL(
        "https://accounts.zoho.eu/oauth/v2/token?client_id=ZOHO_CLIENT_ID&client_secret=ZOHO_CLIENT_SECRET&grant_type=client_credentials&scope=ZohoCRM.modules.ALL%2CZohoCRM.bulk.read&soid=ZohoCRM.ZOHO_SERVICE_ORG_ID",
      );
      await createZohoAccessToken(config);

      expect(mockFetch).toHaveBeenCalledWith(url, {
        method: "post",
      });
    });

    describe("when response is ok", () => {
      it("returns the access token from the response", async () => {
        const accessToken = await createZohoAccessToken(config);

        expect(accessToken).toBe(oauthResponse["access_token"]);
      });
    });

    describe("when response is not ok", () => {
      beforeEach(() => {
        mockFetch.mockResolvedValue(
          new Response(null, { status: 400, statusText: "FAIL" }),
        );
      });

      it("throws an error", async () => {
        await expect(createZohoAccessToken(config)).rejects.toThrow(
          "Zoho oAuth request error: FAIL",
        );
      });
    });
  });
});
