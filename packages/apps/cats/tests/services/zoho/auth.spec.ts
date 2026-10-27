import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import fetch from "node-fetch-native";
import { useRuntimeConfig } from "nitropack/runtime";

import { createZohoAccessToken } from "@/services/zoho/auth";

const mockFetch = vi.mocked(fetch);
const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);

describe("@/services/zoho/auth", () => {
  const oauthResponse = {
    access_token: "ZOHO_ACCESS_TOKEN",
  };
  const config = {
    clientId: "ZOHO_CLIENT_ID",
    clientSecret: "ZOHO_CLIENT_SECRET",
    serviceOrgId: "ZOHO_SERVICE_ORG_ID",
  };

  beforeAll(() => {
    mockFetch.mockResolvedValue({
      body: null,
      json: vi.fn().mockResolvedValue(oauthResponse),
      ok: true,
      status: 200,
    });

    mockUseRuntimeConfig.mockReturnValue({
      zoho: config,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("createZohoAccessToken", () => {
    it("sends a POST request to Zoho oAuth service", async () => {
      const url = new URL(
        "https://accounts.zoho.eu/oauth/v2/token?client_id=ZOHO_CLIENT_ID&client_secret=ZOHO_CLIENT_SECRET&grant_type=client_credentials&scope=ZohoCRM.modules.ALL%2CZohoCRM.bulk.read&soid=ZohoCRM.ZOHO_SERVICE_ORG_ID",
      );
      await createZohoAccessToken();

      expect(mockFetch).toHaveBeenCalledWith(url, {
        method: "post",
      });
    });

    it("returns the access token from the response", async () => {
      const accessToken = await createZohoAccessToken();

      expect(accessToken).toBe(oauthResponse["access_token"]);
    });
  });
});
