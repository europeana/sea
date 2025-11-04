import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentInterface from "./ContentInterface.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return { query: {} };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useI18n", () => {
  return () => {
    return {
      d: (datetime) => datetime,
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
    };
  };
});

const categories = ["network", "postcards"];

const mockBlogMetadata = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  date: `2023-01-${index + 1}`,
  cats: {
    items: [{ id: categories[0] }, { id: categories[1] }],
  },
}));

const mockBlogMetadataWithCategories = [
  {
    __typename: "BlogPosting",
    sys: { id: "id1" },
    date: "2023-01-01",
    cats: { items: [{ id: "network" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "id2" },
    date: "2023-01-02",
    cats: { items: [{ id: "postcards" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "id3" },
    date: "2023-01-03",
    cats: { items: [{ id: "unknown" }] },
  },
];

const mockBlogEntries = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  datePublished: `2023-01-${index + 1}`,
  name: `Entry ${index}`,
}));

const mockQuery = vi.fn();

// Use this function to create custom mock responses for different test cases
const contentfulResponse = (query, entries, metadata) => {
  if (query.definitions?.[0]?.name?.value === "ContentBySysId") {
    return Promise.resolve({
      data: {
        blogPostingCollection: { items: entries.blogs },
        projectPageCollection: { items: entries.projects },
        storyCollection: { items: [] },
        exhibitionPageCollection: { items: [] },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "BlogPostingListingMinimal") {
    return Promise.resolve({
      data: { blogPostingCollection: { items: metadata.blogs } },
    });
  }
  if (query.definitions?.[0]?.name?.value === "ProjectPageListingMinimal") {
    return Promise.resolve({
      data: { projectPageCollection: { items: metadata.projects } },
    });
  }
};

const factory = (props = {}) =>
  mountSuspended(ContentInterface, {
    global: {
      provide: {
        $contentful: { query: mockQuery },
      },
      mocks: {
        $route: {
          query: { page: 1 },
        },
      },
      stubs: ["ContentFeaturedCard", "ContentTagsDropdown"],
    },
    props: {
      contentTypes: ["blog post", "project"],
      site: "dataspace-culturalheritage.eu",
      ...props,
    },
  });

describe("components/Content/ContentInterface", () => {
  beforeEach(() => {
    mockQuery.mockImplementation((query) =>
      contentfulResponse(
        query,
        {
          blogs: mockBlogEntries,
          projects: [],
        },
        {
          blogs: mockBlogMetadata,
          projects: [],
        },
      ),
    );
  });
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });

  it("fetches and renders content entries", async () => {
    const wrapper = await factory();

    await wrapper.vm.$nextTick();

    expect(mockQuery.mock.calls.length).toEqual(3);
    expect(wrapper.findAllComponents({ name: "ContentCard" }).length).toBe(24);
  });
  describe("selectedTags", () => {
    it("defaults to an empty array", async () => {
      const wrapper = await factory();

      expect(wrapper.vm.selectedTags).toEqual([]);
    });

    it("has a selected tag when one is present in the URL", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: categories[0],
        },
      }));
      const wrapper = await factory();
      expect(wrapper.vm.selectedTags.length).toBe(1);
    });

    it("has multiple tags when present in the URL", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: "network,art,manuscripts",
        },
      }));
      const wrapper = await factory();

      expect(wrapper.vm.selectedTags.length).toBe(3);
    });
  });

  describe("selectedType", () => {
    it("defaults to false", async () => {
      const wrapper = await factory();

      expect(wrapper.vm.selectedType).toBe(false);
    });

    it('is set to "project" when the type is set in the URL', async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          type: "project",
        },
      }));
      const wrapper = await factory();

      expect(wrapper.vm.selectedType).toStrictEqual({ type: "ProjectPage" });
    });

    it("contains taxonomy info when the type in the URL requires it", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          type: "training",
        },
      }));
      const wrapper = await factory();

      expect(wrapper.vm.selectedType).toStrictEqual({
        type: "Event",
        taxonomy: "eventTypeTrainingCourse",
      });
    });
  });
  describe("filteredTags", () => {
    describe("when content is filtered to a tag", () => {
      it("selects and sorts categories that are shared with the active filter", async () => {
        const tag = "network";
        mockQuery.mockImplementation((query) =>
          contentfulResponse(
            query,
            { blogs: mockBlogEntries },
            { blogs: mockBlogMetadataWithCategories },
          ),
        );
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: tag,
          },
        }));
        const wrapper = await factory();

        const filteredTags = wrapper.vm.filteredTags;

        expect(filteredTags).toEqual([tag]);
      });
    });
  });
  describe("filteredMinimalEntries", () => {
    describe("when no tags are selected", () => {
      it("defaults to all content", async () => {
        const wrapper = await factory();

        const filteredMinimalEntries = wrapper.vm.filteredMinimalEntries;
        const allContentMetaData = wrapper.vm.minimalEntries.value;

        expect(filteredMinimalEntries).toEqual(allContentMetaData);
      });
    });

    describe("when a tag is selected", () => {
      it("only selects content which has the selected tags", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: categories[0],
          },
        }));
        const wrapper = await factory();

        const filteredMinimalEntries = wrapper.vm.filteredMinimalEntries;

        const expectedContentData = wrapper.vm.minimalEntries.value.filter(
          (entry) => entry.cats.includes(categories[0]),
        );
        expect(filteredMinimalEntries).toEqual(expectedContentData);
      });
    });

    describe("when a type is selected", () => {
      it("only selects content which has the selected type", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            type: "news",
          },
        }));
        const wrapper = await factory();

        const filteredMinimalEntries = wrapper.vm.filteredMinimalEntries;

        const expectedContentData = wrapper.vm.minimalEntries.value.filter(
          (entry) => entry.__typename === "BlogPosting",
        );
        expect(filteredMinimalEntries).toEqual(expectedContentData);
      });
    });
  });
  describe("total", () => {
    it("defaults to 0", async () => {
      mockQuery.mockImplementation((query) =>
        contentfulResponse(query, { blogs: [] }, { blogs: [] }),
      );
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(0);
    });

    it("is based of the filteredMinimalEntries length", async () => {
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(24);
    });

    it("takes into account applied tags", async () => {
      const tag = "network";
      mockQuery.mockImplementation((query) =>
        contentfulResponse(
          query,
          { blogs: mockBlogEntries },
          { blogs: mockBlogMetadataWithCategories },
        ),
      );
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: tag,
        },
      }));
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(1);
    });
  });

  describe("page", () => {
    it("defaults to 1 when no other value is in the URL", async () => {
      const wrapper = await factory();

      const page = wrapper.vm.page;

      expect(page).toBe(1);
    });

    it("uses the page value from the URL when present", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          page: "3",
        },
      }));
      const wrapper = await factory();

      const page = wrapper.vm.page;

      expect(page).toBe(3);
    });
  });
  it("normalises blog content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections[0][0];

    expect(firstEntry.text).toBe("authored.createdDate");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("normalises project content correctly", async () => {
    mockQuery.mockImplementation((query) =>
      contentfulResponse(
        query,
        {
          blogs: mockBlogEntries,
          projects: [
            {
              __typename: "ProjectPage",
              sys: { id: "id2000" },
              datePublished: "2024-01-01",
              name: "Entry PROJECT",
              headline: "headline",
            },
          ],
        },
        {
          blogs: mockBlogMetadata,
          projects: [
            {
              __typename: "ProjectPage",
              sys: { id: "id2000" },
              date: "2024-01-01",
              cats: { items: [{ id: "network" }] },
            },
          ],
        },
      ),
    );

    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections[0][0];

    expect(firstEntry.text).toBe("headline");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  describe("when there is a default card thumbnail", () => {
    it("is used for when there is no primary image of page", async () => {
      const defaultCardThumbnail = {
        image: {
          url: "https://www.example.eu/img.jpg",
          contentType: "image/jpeg",
        },
      };
      const wrapper = await factory({ defaultCardThumbnail });

      const firstEntry = wrapper.vm.contentSections[0][0];

      expect(firstEntry.primaryImageOfPage).toStrictEqual(defaultCardThumbnail);
    });
  });

  describe("isCtaBanner", () => {
    it("detects CTA banners correctly", async () => {
      const wrapper = await factory();

      expect(
        wrapper.vm.isCtaBanner({ __typename: "PrimaryCallToAction" }),
      ).toBe(true);
      expect(wrapper.vm.isCtaBanner([{ __typename: "event" }])).toBe(false);
    });
  });

  it("inserts CTA banners in between content entries", async () => {
    const ctaBanners = [
      { __typename: "PrimaryCallToAction", name: "CTA Banner 1" },
      { __typename: "PrimaryCallToAction", name: "CTA Banner 2" },
      { __typename: "PrimaryCallToAction", name: "CTA Banner 3" },
    ];

    const wrapper = await factory({ ctaBanners });

    // Should return an array with 6 elements: [8 entries, 'cta-banner-0', 8 entries, 'cta-banner-1', 8 entries, 'cta-banner-2']
    expect(wrapper.vm.contentSections.length).toBe(6);
    expect(wrapper.vm.contentSections[0].length).toBe(8);
    expect(wrapper.vm.contentSections[1]).toBe(ctaBanners[0]);
  });

  describe("featured entry", () => {
    describe("when there is a featured entry", () => {
      describe("and no type filter nor tags are selected and on page 1", () => {
        it("displays a featured content card", async () => {
          const wrapper = await factory({
            featuredEntry: { name: "featured content" },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(true);
        });
      });
      describe("and a type filter matching the featured entry type is selected", () => {
        it("displays a featured content card", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              type: "news",
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              __typename: "BlogPosting",
              name: "featured content",
            },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(true);
        });
      });
      describe("and a type filter not matching the featured entry type is selected", () => {
        it("does not display a featured content card", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              type: "project",
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              __typename: "BlogPosting",
              name: "featured content",
            },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(false);
        });
      });
      describe("and a tag matching one of the featured entry tags is selected", () => {
        it("displays a featured content card", async () => {
          const tag = "network";
          useRouteMock.mockImplementation(() => ({
            query: {
              tags: tag,
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              categoriesCollection: { items: [{ identifier: tag }] },
              name: "featured content",
            },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(true);
        });
      });
      describe("and a tag not matching any of the featured entry tags is selected", () => {
        it("does not display a featured content card", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              tags: "history",
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              categoriesCollection: { items: [{ identifier: "network" }] },
              name: "featured content",
            },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(false);
        });
      });
      describe("and page is not 1", () => {
        it("does not display a featured content card", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              page: 2,
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              name: "featured content",
            },
          });

          expect(
            wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
          ).toBe(false);
        });
      });
    });
    describe("when there is a datePublished field", () => {
      it("uses the date as text on the featured content card", async () => {
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            datePublished: new Date("29-10-2025"),
          },
        });

        expect(wrapper.vm.featuredEntryText).toEqual("authored.createdDate");
      });
    });
    describe("when there is no datePublished field", () => {
      it("uses the headline as text on the featured content card", async () => {
        const headline = "This is a headline";
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            headline,
          },
        });

        expect(wrapper.vm.featuredEntryText).toEqual(headline);
      });
    });
  });
});
