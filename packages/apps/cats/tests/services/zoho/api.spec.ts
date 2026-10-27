import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  test,
  vi,
} from "vitest";

import fetch from "node-fetch-native";
import { useRuntimeConfig } from "nitropack/runtime";

import { zohoFetch } from "@/services/zoho/api";
import { createZohoAccessToken } from "@/services/zoho/auth";

vi.mock("@/services/zoho/auth", () => ({
  createZohoAccessToken: vi.fn(),
}));

const mockFetch = vi.mocked(fetch);
const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);
const mockCreateZohoAccessToken = vi.mocked(createZohoAccessToken);

describe("@/services/zoho/api", () => {
  const accessToken = "ZOHO_ACCESS_TOKEN";
  const config = {
    clientId: "ZOHO_CLIENT_ID",
    clientSecret: "ZOHO_CLIENT_SECRET",
    serviceOrgId: "ZOHO_SERVICE_ORG_ID",
  };
  const url = "/crm/v8/Contacts";

  beforeAll(() => {
    mockFetch.mockResolvedValue({
      body: null,
      json: vi.fn().mockResolvedValue({}),
      ok: true,
      status: 200,
    });

    mockUseRuntimeConfig.mockReturnValue({
      zoho: config,
    });

    mockCreateZohoAccessToken.mockResolvedValue(accessToken);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("zohoFetch", () => {
    it("sends an authenticated request to Zoho API", async () => {
      await zohoFetch(url);

      expect(mockFetch).toHaveBeenCalledWith(
        new URL("https://www.zohoapis.eu/crm/v8/Contacts"),
        {
          method: "get",
          headers: {
            authorization: "Zoho-oauthtoken ZOHO_ACCESS_TOKEN",
          },
        },
      );
    });

    describe("when the response is ok", () => {
      const bodyContent = {
        id: "1234",
      };
      const fetchResponse = {
        json: vi.fn().mockResolvedValue(bodyContent),
        ok: true,
        status: 200,
      };

      beforeAll(() => {
        mockFetch.mockResolvedValue(fetchResponse);
      });

      it("returns the response", async () => {
        const zohoFetchResponse = await zohoFetch(url);

        expect(zohoFetchResponse).toEqual(fetchResponse);
      });
    });

    describe("when the response is not ok", () => {
      describe("and is due to access token expiry", () => {
        test.todo("refreshes the access token and tries again");
      });

      describe("and is not due to access token expiry", () => {
        const fetchResponse = {
          json: vi.fn().mockResolvedValue(null),
          ok: false,
          status: 500,
        };

        beforeAll(() => {
          mockFetch.mockResolvedValue(fetchResponse);
        });

        it("throws an error", async () => {
          let err;

          try {
            await zohoFetch(url);
          } catch (e) {
            err = e;
          }

          expect(err?.message).toBe("Zoho CRM API request error: 500");
        });
      });
    });
  });
});
