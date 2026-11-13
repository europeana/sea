import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRuntimeConfig } from "nitropack/runtime";
import {
  createZohoAPIClient,
  type ZohoAPIClient,
} from "@europeana/zoho-client";

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn(),
}));

vi.mock("@europeana/zoho-client", () => ({
  createZohoAPIClient: vi.fn(),
}));

describe("@/utils/zoho", () => {
  const mockZohoConfig = {
    clientId: "zoho-client-id",
    clientSecret: "zoho-client-secret",
    refreshToken: "zoho-refresh-token",
  };

  const mockClient = {
    crm: {
      fetchZohoContact: vi.fn(),
    },
  } as unknown as ZohoAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(useRuntimeConfig).mockReturnValue({
      zoho: mockZohoConfig,
    } as ReturnType<typeof useRuntimeConfig>);

    vi.mocked(createZohoAPIClient).mockReturnValue(mockClient);
  });

  it("initialises and returns the Zoho API client using runtime config", async () => {
    const { useZoho } = await import("@/utils/zoho");

    const client = useZoho();

    expect(useRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(createZohoAPIClient).toHaveBeenCalledTimes(1);
    expect(createZohoAPIClient).toHaveBeenCalledWith(mockZohoConfig);
    expect(client).toBe(mockClient);
  });

  it("caches the Zoho API client across subsequent calls", async () => {
    const { useZoho } = await import("@/utils/zoho");

    const firstClient = useZoho();
    const secondClient = useZoho();

    expect(firstClient).toBe(secondClient);
    expect(useRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(createZohoAPIClient).toHaveBeenCalledTimes(1);
  });

  it("passes undefined to createZohoAPIClient when zoho runtime config is missing", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue(
      {} as ReturnType<typeof useRuntimeConfig>,
    );

    const { useZoho } = await import("@/utils/zoho");

    const client = useZoho();

    expect(createZohoAPIClient).toHaveBeenCalledWith(undefined);
    expect(client).toBe(mockClient);
  });
});
