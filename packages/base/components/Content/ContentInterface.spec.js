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

const mockBlogMetadata = Array.from({ length: 8 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `blog-id${index}` },
  date: `2023-01-${index + 1}`,
  cats: {
    items: [],
  },
}));

const mockProjectMetadata = Array.from({ length: 8 }, (key, index) => ({
  __typename: "ProjectPage",
  sys: { id: `project-id${index}` },
  cats: {
    items: [],
  },
  project: { startDate: `2025-01-${index + 1}` },
}));

const mockEventMetadata = Array.from({ length: 8 }, (key, index) => ({
  __typename: "Event",
  sys: { id: `event-id${index}` },
  date: `2026-01-${index + 1}`,
  cats: {
    items: [],
  },
}));

const mockBlogEntries = Array.from({ length: 8 }, (key, index) => ({
  ...mockBlogMetadata[index],
  name: `Blog post entry ${index}`,
}));

const mockProjectEntries = Array.from({ length: 8 }, (key, index) => ({
  ...mockProjectMetadata[index],
  name: `Project page entry ${index}`,
  headline: `Project headline ${index}`,
}));

const mockEventEntries = Array.from({ length: 8 }, (key, index) => ({
  ...mockEventMetadata[index],
  startDate: `2026-01-${index + 1}`,
  name: `Event entry ${index}`,
}));

const mockBlogMetadataWithCategories = [
  {
    __typename: "BlogPosting",
    sys: { id: "blog-id1" },
    date: "2023-01-01",
    cats: { items: [{ id: "network" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "blog-id2" },
    date: "2023-01-02",
    cats: { items: [{ id: "postcards" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "blog-id3" },
    date: "2023-01-03",
    cats: { items: [{ id: "unknown" }] },
  },
];

const mockQuery = vi.fn();

// Use this function to create custom mock responses for different test cases
const contentfulResponse = (query, entries, metadata) => {
  if (query.definitions?.[0]?.name?.value === "BlogPostingsListing") {
    return Promise.resolve({
      data: {
        blogPostingCollection: { items: entries.blogs },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "ProjectPagesListing") {
    return Promise.resolve({
      data: {
        projectPageCollection: { items: entries.projects },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "EventsListing") {
    return Promise.resolve({
      data: {
        eventCollection: { items: entries.events },
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
  if (query.definitions?.[0]?.name?.value === "EventsListingMinimal") {
    return Promise.resolve({
      data: { eventCollection: { items: metadata.events } },
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
      stubs: [
        "ContentCard",
        "ContentFeaturedCard",
        "ContentTagsFilter",
        "ContentTypeFilter",
        "GenericCallToActionBanner",
        "PaginationNavInput",
      ],
    },
    props: {
      contentTypes: ["blog post", "project", "event"],
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
          projects: mockProjectEntries,
          events: mockEventEntries,
        },
        {
          blogs: mockBlogMetadata,
          projects: mockProjectMetadata,
          events: mockEventMetadata,
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

    expect(mockQuery.mock.calls.length).toEqual(4);
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

    const firstEntry = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "BlogPosting",
    )[0];

    expect(firstEntry.text).toBe("authored.publishedDate");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("normalises project content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "ProjectPage",
    )[0];

    expect(firstEntry.text).toBe("Project headline 7");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("normalises event content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "Event",
    )[0];

    expect(firstEntry.text).toBe("2026-01-8");
    expect(firstEntry.primaryImageOfPage.image).toBe(undefined);
  });

  it("normalises blog content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "BlogPosting",
    )[0];

    expect(firstEntry.text).toBe("authored.publishedDate");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("orders project content by project start date", async () => {
    const wrapper = await factory();

    const projectEntries = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "ProjectPage",
    );

    expect(projectEntries[0].project.startDate).toBe("2025-01-8");
    expect(projectEntries[7].project.startDate).toBe("2025-01-1");
  });

  it("orders event content by start date", async () => {
    const wrapper = await factory();

    const eventEntries = wrapper.vm.contentSections[0].filter(
      (entry) => entry.__typename === "Event",
    );

    expect(eventEntries[0].startDate).toBe("2026-01-8");
    expect(eventEntries[7].startDate).toBe("2026-01-1");
  });

  it("orders content by start or publication date", async () => {
    const wrapper = await factory();

    const entries = wrapper.vm.contentSections[0];

    expect(entries[0].startDate).toBe("2026-01-8");
    expect(entries[8].project.startDate).toBe("2025-01-8");
    expect(entries[16].date).toBe("2023-01-8");
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
      describe("and a type filter matching the featured entry type as well as the featured taxonomy is selected", () => {
        it("displays a featured content card", async () => {
          useRouteMock.mockImplementation(() => ({
            query: {
              type: "event",
            },
          }));
          const wrapper = await factory({
            featuredEntry: {
              __typename: "Event",
              contentfulMetadata: {
                concepts: [
                  {
                    id: "eventTypeEvent",
                  },
                ],
              },
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

        expect(wrapper.vm.featuredEntryText).toEqual("authored.publishedDate");
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
    describe("when it is for a training course", () => {
      it("uses the formatted training dates as a text on the featured card", async () => {
        const startDate = "2025-10-16T00:00:00.000+01:00";
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            contentfulMetadata: {
              concepts: [
                {
                  id: "eventTypeTrainingCourse",
                },
              ],
            },
            startDate,
          },
        });

        expect(wrapper.vm.featuredEntryText).toEqual("training.dateRange");
      });
    });
    describe("when it is for an event", () => {
      it("uses the formatted event dates as a text on the featured card", async () => {
        const startDate = "2025-10-16T00:00:00.000+01:00";
        const endDate = "2025-15-16T00:00:00.000+01:00";
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            contentfulMetadata: {
              concepts: [
                {
                  id: "eventTypeEvent",
                },
              ],
            },
            startDate,
            endDate,
          },
        });

        expect(wrapper.vm.featuredEntryText).toEqual("event.dateRange");
      });
    });
  });
});
