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

const mockBlogEntries = Array.from({ length: 4 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `blog-id${index}` },
  date: `2023-01-${index + 1}`,
  name: `Blog post entry ${index}`,
}));

const mockProjectEntries = Array.from({ length: 4 }, (key, index) => ({
  __typename: "ProjectPage",
  sys: { id: `project-id${index}` },
  project: { startDate: `2025-01-${index + 1}` },
  name: `Project page entry ${index}`,
  headline: `Project headline ${index}`,
}));

const mockEventEntries = Array.from({ length: 4 }, (key, index) => ({
  __typename: "Event",
  sys: { id: `event-id${index}` },
  date: `2026-01-${index + 1}`,
  startDate: `2026-01-${index + 1}`,
  name: `Event entry ${index}`,
}));

const mockQuery = vi.fn();

// Use this function to create custom mock responses for different test cases
const contentfulResponse = (query, entries) => {
  if (query.definitions?.[0]?.name?.value === "BlogPostingsListing") {
    return Promise.resolve({
      data: {
        blogPostingCollection: {
          total: entries.blogs?.length,
          items: entries.blogs,
        },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "ProjectPagesListing") {
    return Promise.resolve({
      data: {
        projectPageCollection: {
          total: entries.projects?.length,
          items: entries.projects,
        },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "EventsListing") {
    return Promise.resolve({
      data: {
        eventCollection: {
          total: entries.events?.length,
          items: entries.events,
        },
      },
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
    slots: { "error-message": "<div class='error-message' />" },
  });

describe("components/Content/ContentInterface", () => {
  beforeEach(() => {
    mockQuery.mockImplementation((query) =>
      contentfulResponse(query, {
        blogs: mockBlogEntries,
        projects: mockProjectEntries,
        events: mockEventEntries,
      }),
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
    expect(wrapper.findAll("content-card-stub").length).toBe(12);
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

  describe("total", () => {
    it("defaults to 0", async () => {
      mockQuery.mockImplementation((query) =>
        contentfulResponse(query, { blogs: [] }),
      );
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(0);
    });

    it("is based of the response total", async () => {
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(12);
    });
    describe("when there is a featured content entry", () => {
      it("is based of the sum of the response total and featured content", async () => {
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            __typename: "BlogPosting",
          },
        });

        const total = wrapper.vm.total;

        expect(total).toEqual(13);
      });
    });
    describe("when 0 results", () => {
      it("renders the error message slot", async () => {
        mockQuery.mockImplementation((query) =>
          contentfulResponse(query, { blogs: [] }, { blogs: [] }),
        );
        const wrapper = await factory();

        const errorMessage = wrapper.find(".error-message");

        expect(errorMessage.exists()).toBe(true);
      });
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

    const firstEntry = wrapper.vm.contentSections.filter(
      (section) => section.type === "BlogPosting",
    )[0].entries[0];

    expect(firstEntry.text).toBe("authored.publishedDate");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("normalises project content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections.filter(
      (section) => section.type === "ProjectPage",
    )[0].entries[0];

    expect(firstEntry.text).toBe("Project headline 0");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });

  it("normalises event content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentSections.filter(
      (section) => section.type === "eventTypeEvent",
    )[0].entries[0];

    expect(firstEntry.text).toBe("2026-01-1");
    expect(firstEntry.primaryImageOfPage.image).toBe(undefined);
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

      const firstEntry = wrapper.vm.contentSections[0].entries[0];

      expect(firstEntry.primaryImageOfPage).toStrictEqual(defaultCardThumbnail);
    });
  });

  it("inserts CTA banners in between content entries", async () => {
    const ctaBanners = [
      { __typename: "PrimaryCallToAction", name: "CTA Banner 1" },
      { __typename: "PrimaryCallToAction", name: "CTA Banner 2" },
    ];

    const wrapper = await factory({ ctaBanners });

    // Should return an array with 5 elements: [[4 entries], [4 entries], 'cta-banner-0', [4 entries], 'cta-banner-1']
    expect(wrapper.vm.contentSections.length).toBe(5);
    expect(wrapper.vm.contentSections[0].entries.length).toBe(4);
    expect(wrapper.vm.contentSections[1].entries.length).toBe(4);
    expect(wrapper.vm.contentSections[2]).toBe(ctaBanners[0]);
    expect(wrapper.vm.contentSections[3].entries.length).toBe(4);
    expect(wrapper.vm.contentSections[4]).toBe(ctaBanners[1]);
  });

  describe("featured entry", () => {
    describe("when there is no featured entry", () => {
      it("does not display a featured content card", async () => {
        const wrapper = await factory();

        expect(
          wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
        ).toBe(false);
      });
    });
    describe("when the featured entry is not of a supported content type", () => {
      it("does not display a featured content card", async () => {
        const wrapper = await factory({
          featuredEntry: {
            name: "featured content",
            __typename: "LandingPage",
          },
        });

        expect(
          wrapper.findComponent({ name: "ContentFeaturedCard" }).exists(),
        ).toBe(false);
      });
    });
    describe("when there is a featured entry with a supported content type", () => {
      describe("and no type filter nor tags are selected and on page 1", () => {
        it("displays a featured content card", async () => {
          const wrapper = await factory({
            featuredEntry: {
              name: "featured content",
              __typename: "BlogPosting",
            },
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
              __typename: "BlogPosting",
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
