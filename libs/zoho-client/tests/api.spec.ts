import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createZohoAPIClient } from "../src/api.js";
import { createZohoAccessToken } from "../src/auth.js";
import { ZohoCRMClient } from "../src/crm.js";
import { ZohoAuthConfig } from "../src/types.js";

vi.mock("../src/auth.js", () => ({
  createZohoAccessToken: vi.fn(),
}));

const mockFetch = vi.mocked(global.fetch);
const mockCreateZohoAccessToken = vi.mocked(createZohoAccessToken);

describe("@/services/zoho/api", () => {
  const accessToken = "ZOHO_ACCESS_TOKEN";
  const config: ZohoAuthConfig = {
    clientId: "ZOHO_CLIENT_ID",
    clientSecret: "ZOHO_CLIENT_SECRET",
    serviceOrgId: "ZOHO_SERVICE_ORG_ID",
  };
  const url = "/crm/v8/Contacts";

  const responses = {
    ok: {
      json: vi.fn().mockResolvedValue({ id: "1234" }),
      ok: true,
      status: 200,
    },
    internalServerError: {
      json: vi.fn().mockResolvedValue(null),
      ok: false,
      status: 500,
    },
    unauthorized: {
      // TODO: why does this not work here?
      // json: vi.fn().mockResolvedValue({ code: "INVALID_TOKEN" }),
      json: () => Promise.resolve({ code: "INVALID_TOKEN" }),
      ok: false,
      status: 401,
    },
  };

  beforeEach(() => {
    let accessTokenCount = 0;

    mockCreateZohoAccessToken.mockImplementation(() => {
      accessTokenCount = accessTokenCount + 1;
      return Promise.resolve(`${accessToken}_${accessTokenCount}`);
    });
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createZohoAPIClient", () => {
    describe("request", () => {
      it("sends an authenticated request to Zoho API", async () => {
        await createZohoAPIClient(config).request(url, {
          method: "post",
          body: JSON.stringify({ criteria: true }),
          params: { query: "smith" },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          new URL("https://www.zohoapis.eu/crm/v8/Contacts?query=smith"),
          {
            method: "post",
            body: JSON.stringify({ criteria: true }),
            headers: {
              authorization: "Zoho-oauthtoken ZOHO_ACCESS_TOKEN_1",
            },
          },
        );
      });

      describe("when the response is ok", () => {
        beforeAll(() => {
          mockFetch.mockResolvedValue(responses.ok);
        });

        it("returns the response", async () => {
          const zohoFetchResponse =
            await createZohoAPIClient(config).request(url);

          expect(zohoFetchResponse).toEqual(responses.ok);
        });
      });

      describe("when the response is not ok", () => {
        describe("and is due to access token expiry", () => {
          beforeAll(() => {
            mockFetch.mockImplementation((resource, { headers }) => {
              if (headers.authorization.endsWith("_1")) {
                return Promise.resolve(responses.unauthorized);
              } else {
                return Promise.resolve(responses.ok);
              }
            });
          });

          it("refreshes the access token and tries again", async () => {
            const response = await createZohoAPIClient(config).request(url);

            expect(mockCreateZohoAccessToken.mock.calls).toHaveLength(2);
            expect(mockFetch.mock.calls).toHaveLength(2);
            expect(mockFetch.mock.calls[0][1].headers.authorization).toBe(
              "Zoho-oauthtoken ZOHO_ACCESS_TOKEN_1",
            );
            expect(mockFetch.mock.calls[1][1].headers.authorization).toBe(
              "Zoho-oauthtoken ZOHO_ACCESS_TOKEN_2",
            );
            expect(response).toEqual(responses.ok);
          });
        });

        describe("and is not due to access token expiry", () => {
          beforeEach(() => {
            mockFetch.mockResolvedValue(responses.internalServerError);
          });

          it("throws an error", async () => {
            let err;

            try {
              await createZohoAPIClient(config).request(url);
            } catch (e) {
              err = e;
            }

            expect(err?.message).toBe("Zoho CRM API request error: 500");
          });
        });
      });
    });

    describe("crm", () => {
      it("is an instance of ZohoCRMClient", () => {
        const crm = createZohoAPIClient(config).crm;

        expect(crm).toBeInstanceOf(ZohoCRMClient);
      });
    });
  });
});
