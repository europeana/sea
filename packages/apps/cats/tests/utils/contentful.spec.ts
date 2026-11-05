import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import contentfulManagement from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

import {
  useContentfulEnvironment,
  findEntry,
} from "../../server/utils/contentful";

const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);

describe("@/utils/contentful", () => {
  afterEach(() => {
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

  describe("findEntry", () => {
    let mockGetEntries;
    const query = {
      content_type: "page",
    };
    const entry = { sys: { id: "entryid" } };

    beforeEach(() => {
      const mockCreateClient = vi.mocked(contentfulManagement.createClient);
      const mockGetSpace = vi.mocked(mockCreateClient().getSpace);
      const mockGetEnvironment = vi.mocked(mockGetSpace().getEnvironment);
      mockGetEntries = vi.mocked(mockGetEnvironment().getEntries);
      mockGetEntries.mockResolvedValue({ total: 0 });
    });

    it("gets entries for query from contentful SDK", async () => {
      await findEntry(query);

      expect(mockGetEntries).toHaveBeenCalledWith(query);
    });

    describe("when 1 entry is found", () => {
      it("returns the entry", async () => {
        mockGetEntries.mockResolvedValue({ total: 1, items: [entry] });

        const response = await findEntry(query);

        expect(response).toEqual(entry);
      });
    });

    describe("when > 1 entry is found", () => {
      it("returns null", async () => {
        mockGetEntries.mockResolvedValue({ total: 2, items: [entry, entry] });

        const response = await findEntry(query);

        expect(response).toBeNull();
      });
    });

    describe("when no entries are found", () => {
      it("returns null", async () => {
        const response = await findEntry(query);

        expect(response).toBeNull();
      });
    });
  });
});
