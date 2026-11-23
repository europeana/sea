import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createClient,
  type CollectionProp,
  type EntryProps,
  type KeyValueMap,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

import {
  createOrUpdateEntry,
  findEntry,
  useContentfulClient,
} from "@/utils/contentful";

describe("@/utils/contentful", () => {
  const config = {
    accessToken: "CTF_ACCESS_TOKEN",
    environment: "CTF_ENVIRONMENT",
    space: "CTF_SPACE",
    defaultLocale: "en-GB",
  };

  const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig);
  const mockCreateClient = vi.mocked(createClient);
  const mockClient = mockCreateClient({ accessToken: "" });

  const mockGetManyEntries = vi.mocked(mockClient.entry.getMany);
  const mockCreateEntry = vi.mocked(mockClient.entry.create);
  const mockUpdateEntry = vi.mocked(mockClient.entry.update);
  const mockPublishEntry = vi.mocked(mockClient.entry.publish);

  beforeEach(() => {
    mockUseRuntimeConfig.mockReturnValue({
      contentful: config,
    } as unknown as ReturnType<typeof useRuntimeConfig>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("useContentfulClient", () => {
    it("uses the SDK to create the Contentful client for the runtime config", () => {
      useContentfulClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        {
          accessToken: config.accessToken,
        },
        {
          defaults: {
            spaceId: config.space,
            environmentId: config.environment,
          },
        },
      );
    });
  });

  describe("createOrUpdateEntry", () => {
    const contentTypeId = "page";
    const query = {
      content_type: "page",
    };

    let fields: KeyValueMap;
    let entry: EntryProps<KeyValueMap>;

    beforeEach(() => {
      fields = {
        title: { "en-GB": "About" },
        categories: { "en-GB": ["good category"] },
      };
      entry = {
        sys: { id: "entryid" },
        fields: {
          slug: { "en-GB": "about" },
          title: { "en-GB": "about" },
        },
      } as unknown as EntryProps<KeyValueMap>;
    });

    describe("when entry already exists", () => {
      beforeEach(() => {
        mockGetManyEntries.mockResolvedValue({
          total: 1,
          items: [entry],
        } as unknown as CollectionProp<EntryProps<KeyValueMap>>);
        mockUpdateEntry.mockResolvedValue(entry);
      });

      it("gets the updated fields", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.fields.title).toEqual(fields.title);
      });

      it("omits invalid array field values, per the content type validation", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(entry.fields.categories).toEqual({
          "en-GB": ["good category"],
        });
      });

      it("updated via the SDK", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(mockUpdateEntry).toHaveBeenCalledWith(
          { entryId: "entryid" },
          entry,
        );
      });

      it("is published by default", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(mockPublishEntry).toHaveBeenCalledWith(
          { entryId: "entryid" },
          entry,
        );
      });

      it("is optionally not published", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields, false);

        expect(mockPublishEntry).not.toHaveBeenCalled();
      });
    });

    describe("when entry does not already exist", () => {
      beforeEach(() => {
        mockGetManyEntries.mockResolvedValue({
          total: 0,
          items: [],
        } as unknown as CollectionProp<EntryProps<KeyValueMap>>);
        mockCreateEntry.mockResolvedValue(entry);
      });

      it("created via the SDK", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(mockCreateEntry).toHaveBeenCalledWith(
          { contentTypeId },
          { fields },
        );
      });

      it("is published by default", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields);

        expect(mockPublishEntry).toHaveBeenCalledWith(
          { entryId: "entryid" },
          entry,
        );
      });

      it("is optionally not published", async () => {
        await createOrUpdateEntry(contentTypeId, query, fields, false);

        expect(mockPublishEntry).not.toHaveBeenCalled();
      });
    });
  });

  describe("findEntry", () => {
    const query = {
      content_type: "page",
    };
    const entry = {
      sys: { id: "entryid" },
    } as unknown as EntryProps<KeyValueMap>;

    beforeEach(() => {
      mockGetManyEntries.mockResolvedValue({
        total: 0,
        items: [],
      } as unknown as CollectionProp<EntryProps<KeyValueMap>>);
    });

    it("gets entries for query from contentful SDK", async () => {
      await findEntry(query);

      expect(mockGetManyEntries).toHaveBeenCalledWith({ query });
    });

    describe("when an entry is found", () => {
      it("returns the first entry", async () => {
        mockGetManyEntries.mockResolvedValue({
          total: 1,
          items: [entry],
        } as unknown as CollectionProp<EntryProps<KeyValueMap>>);

        const response = await findEntry(query);

        expect(response).toEqual(entry);
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
