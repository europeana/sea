import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import contentfulManagement from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

import {
  createOrUpdateEntry,
  findEntry,
  useContentfulEnvironment,
} from "../../server/utils/contentful";

describe("@/utils/contentful", () => {
  const config = {
    accessToken: "CTF_ACCESS_TOKEN",
    environment: "CTF_ENVIRONMENT",
    space: "CTF_SPACE",
    defaultLocale: "en-GB",
  };

  const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);
  const mockCreateClient = vi.mocked(contentfulManagement.createClient);
  const mockGetSpace = vi.mocked(mockCreateClient().getSpace);
  const mockGetEnvironment = vi.mocked(mockGetSpace().getEnvironment);
  const mockGetEntries = vi.mocked(mockGetEnvironment().getEntries);
  const mockGetContentType = vi.mocked(mockGetEnvironment().getContentType);
  const mockCreateEntry = vi.mocked(mockGetEnvironment().createEntry);

  beforeEach(() => {
    mockUseRuntimeConfig.mockReturnValue({
      contentful: config,
    });
    mockGetContentType.mockResolvedValue({
      fields: [
        { id: "slug", type: "Symbol" },
        { id: "title", type: "Text" },
        {
          id: "categories",
          type: "Array",
          items: { validations: [{ in: ["good category"] }] },
        },
      ],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("useContentfulEnvironment", () => {
    it("uses the SDK to get the Contentful environment for the runtime config", async () => {
      await useContentfulEnvironment();

      expect(mockCreateClient).toHaveBeenCalledWith({
        accessToken: config.accessToken,
      });
      expect(mockGetSpace).toHaveBeenCalledWith(config.space);
      expect(mockGetEnvironment).toHaveBeenCalledWith(config.environment);
    });
  });

  describe("createOrUpdateEntry", () => {
    const contentTypeId = "page";
    const query = {
      content_type: "page",
    };
    const fields = {
      title: { "en-GB": "About" },
      categories: { "en-GB": ["good category", "bad category"] },
    };
    const entry = {
      sys: { id: "entryid" },
      fields: {
        slug: { "en-GB": "about" },
        title: { "en-GB": "about" },
      },
      publish: vi.fn(),
      update: vi.fn(),
    };

    describe("when entry already exists", () => {
      beforeEach(() => {
        mockGetEntries.mockResolvedValue({ total: 1, items: [entry] });
        entry.update.mockResolvedValue(entry);
      });

      it("gets the updated fields", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.fields.title).toEqual(fields.title);
      });

      it("omits invalid array field values, per the content type validation", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.fields.categories).toEqual({ "en-GB": ["good category"] });
      });

      it("updated via the SDK", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.update).toHaveBeenCalledWith();
      });

      it("is published by default", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.publish).toHaveBeenCalledWith();
      });

      it("is optionally not published", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields, false);

        expect(entry.publish).not.toHaveBeenCalled();
      });
    });

    describe("when entry does not already exist", () => {
      beforeEach(() => {
        mockGetEntries.mockResolvedValue({ total: 0 });
        mockCreateEntry.mockResolvedValue(entry);
      });

      it("created via the SDK", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(mockCreateEntry).toHaveBeenCalledWith(contentTypeId, { fields });
      });

      it("omits invalid array field values, per the content type validation", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.fields.categories).toEqual({ "en-GB": ["good category"] });
      });

      it("is published by default", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.publish).toHaveBeenCalledWith();
      });

      it("is optionally not published", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields, false);

        expect(entry.publish).not.toHaveBeenCalled();
      });
    });
  });

  describe("findEntry", () => {
    const query = {
      content_type: "page",
    };
    const entry = { sys: { id: "entryid" } };

    beforeEach(() => {
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
