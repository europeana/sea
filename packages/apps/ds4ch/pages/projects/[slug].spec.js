import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ProjectPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
    };
  };
});
const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return {
      path: "/en/news/slug",
      fullPath: "/en/news/slug",
      params: { slug: "slug" },
      query: {},
    };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useAsyncPageData", () => async (cacheId, callback) => {
  const result = await callback();
  return { page: ref(result.page) };
});

const contentfulResponse = {
  data: {
    projectPageCollection: {
      items: [
        {
          identifier: "project-identifier",
          name: "Project Page Name",
          primaryImageOfPage: {
            image: {
              url: "https://images.ctfassets.net/i01duvb6kq77/7Jnq4yka0vfYdWKo7IV7Dc/5778788f0359b1a6a81ef1f57a260982/feature_1920Olympics.jpg",
              contentType: "image/jpeg",
              width: "1000",
              height: "600",
            },
          },
          headline: "This appears on the card and as a headline",
          description: "Project description",
          project: {
            name: "project name",
            logo: null,
            startDate: "2025-02-01T00:00:00.000+02:00",
            endDate: "2026-07-31T00:00:00.000+02:00",
            factSheet: {
              contentType: "application/pdf",
              url: "https://example.org/report_1.pdf",
              description: null,
              title: "report1.pdf",
            },
            goals:
              "- Strengthen and enrich the common European data space.\n- Advance the digital transformation of cultural heritage institutions.",
            partners: "- A, Italy \n- B, Belgium \n- C, Netherlands",
            contractNumber: "#101174054",
            impactMetrics: [
              "scenarios: 3000",
              "Online training events organized: 4",
              "Tools: 5",
            ],
            testimonial: {
              text: "It was really good!",
              attribution: "Me",
            },
            fundingStream: {
              url: "https://digital-strategy.ec.europa.eu/en/activities/digital-programme",
              text: "The Digital Europe Programme (DIGITAL)",
            },
            fundingLogosCollection: [
              {
                contentType: "image/png",
                height: 149,
                url: "https://example.org/image.png",
                width: 1067,
                description: null,
                title: "Logo - Co-financed by the European Union",
              },
            ],
            reportsCollection: {
              items: [
                {
                  contentType: "application/pdf",
                  url: "https://example.org/report_1.pdf",
                  description: null,
                  title: "report1.pdf",
                },
                {
                  contentType: "application/pdf",
                  url: "https://example.org/report_2.pdf",
                  description: null,
                  title: "report2.pdf",
                },
              ],
            },
          },
          categoriesCollection: {
            items: [
              {
                name: "network",
                identifier: "network",
              },
              {
                name: "data",
                identifier: "data",
              },
            ],
          },
        },
      ],
    },
  },
};
const mockQuery = vi.fn(() => contentfulResponse);
const factory = async () =>
  await mountSuspended(ProjectPage, {
    global: {
      provide: {
        $contentful: {
          query: mockQuery,
        },
      },
    },
  });

describe("ProjectPage", () => {
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });
  // describe('page meta', () => {
  // TODO: add tests
  // });
  describe("page sections", () => {
    it("renders an h1 element with the page name from Contentful", async () => {
      const wrapper = await factory();
      const h1 = wrapper.find("h1");

      expect(h1.text()).toBe("Project Page Name");
    });

    it("renders an image with attribution", async () => {
      const wrapper = await factory();

      const imageWithAttribution = wrapper.find(".hero img");

      expect(imageWithAttribution.attributes("src")).toEqual(
        "https://images.ctfassets.net/i01duvb6kq77/7Jnq4yka0vfYdWKo7IV7Dc/5778788f0359b1a6a81ef1f57a260982/feature_1920Olympics.jpg?w=1100&q=80&fm=webp",
      );
    });

    it("renders the headline text", async () => {
      const wrapper = await factory();
      const p = wrapper.find("p");

      expect(p.text()).toBe("This appears on the card and as a headline");
    });

    it("renders the formatted project dates", async () => {
      const wrapper = await factory();
      const dates = wrapper.find("time");

      expect(dates.text()).toBe("projects.dates");
    });

    it("renders a share button", async () => {
      const wrapper = await factory();
      const shareButton = wrapper.find("button.share-button");

      expect(shareButton.exists()).toBe(true);
    });

    it("renders the project description", async () => {
      const wrapper = await factory();
      const dates = wrapper.find("time");

      expect(dates.text()).toBe("projects.dates");
    });
  });

  describe("when NOT in preview mode", () => {
    it("requests from contentful with the preview arg set to false", async () => {
      await factory();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ preview: false }),
      );
    });
  });

  describe("when in preview mode", () => {
    it("requests from contentful with the preview arg set to true", async () => {
      useRouteMock.mockImplementation(() => ({
        path: "/en/projects/slug",
        fullPath: "/en/projects/slug?mode=preview",
        params: { slug: "slug" },
        query: {
          mode: "preview",
        },
      }));
      await factory();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ preview: true }),
      );
    });
  });
  // TODO: add tests for project related fields/sections
});
