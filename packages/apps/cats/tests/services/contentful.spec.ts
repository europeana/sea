import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import contentfulManagement from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

import { useContentfulEnvironment } from "@/services/contentful";

const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);

describe("@/services/contentful", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("useContentfulEnvironment", () => {
    it("uses the SDK to get the Contentful environment for the runtime config", async () => {
      const config = {
        accessToken: "CTF_ACCESS_TOKEN",
        environment: "CTF_ENVIRONMENT",
        space: "CTF_SPACE",
      };
      mockUseRuntimeConfig.mockReturnValue({
        contentful: config,
      });

      const mockCreateClient = vi.mocked(contentfulManagement.createClient);
      const mockGetSpace = vi.mocked(mockCreateClient().getSpace);
      const mockGetEnvironment = vi.mocked(mockGetSpace().getEnvironment);

      await useContentfulEnvironment();

      expect(mockCreateClient).toHaveBeenCalledWith({
        accessToken: config.accessToken,
      });
      expect(mockGetSpace).toHaveBeenCalledWith(config.space);
      expect(mockGetEnvironment).toHaveBeenCalledWith(config.environment);
    });
  });
});
