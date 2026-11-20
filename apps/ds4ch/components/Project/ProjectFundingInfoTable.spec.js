import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectFundingInfoTable from "./ProjectFundingInfoTable.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
    };
  };
});

describe("components/Project/ProjectFundingInfoTable", () => {
  it("renders an extra row for funders logo's", () => {
    const wrapper = mount(ProjectFundingInfoTable, {
      props: {
        project: {
          fundingLogosCollection: {
            items: [
              {
                url: "",
                image: {
                  url: "https://www.example.eu/img.png",
                  width: 100,
                  height: 100,
                },
              },
              {
                url: "",
                image: {
                  url: "https://www.example.eu/img.svg",
                  width: 100,
                  height: 100,
                },
              },
            ],
          },
        },
      },
      global: {
        stubs: ["RouterLink"],
      },
    });

    const fundingLogos = wrapper.findAll(".funding-logo");

    expect(fundingLogos.length).toBe(2);
  });
});
