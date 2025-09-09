import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ProjectPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});
const contentfulResponse = {
  data: {
    projectCollection: {
      items: [
        {
          logo: null,
          primaryImageOfPage: null,
          factSheet: null,
          identifier: "project-identifier",
          name: "Project Name",
          headline: "This appears on the card and as a headline",
          startDate: "2025-02-01T00:00:00.000+02:00",
          endDate: "2026-07-31T00:00:00.000+02:00",
          description: "Project description",
          goals:
            "- Strengthen and enrich the common European data space.\n- Advance the digital transformation of cultural heritage institutions.",
          partners: "- A, Italy \n- B, Belgium \n- C, Netherlands",
          partnerEntities: null,
          fundingLogoUrl: "https://eu.eu",
          contactNumber: "#101174054",
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
          fundingLogo: {
            contentType: "image/png",
            height: 149,
            url: "https://example.org/image.png",
            width: 1067,
            description: null,
            title: "Logo - Co-financed by the European Union",
          },
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
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(ProjectPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

describe("ProjectPage", () => {
  it("renders an h1 element with the page name from Contentful", async () => {
    const wrapper = await factory();

    const h1 = wrapper.find("h1");

    expect(h1.text()).toBe("Project Name");
  });
  // TODO: add tests
});
