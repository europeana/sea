import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import PageCookiesSection from "./PageCookiesSection.vue";

const { useI18nMock } = vi.hoisted(() => ({
  useI18nMock: vi.fn(() => {
    return {
      fallbackLocale: "en",
      t: (key) => key,
      te: () => true,
    };
  }),
}));
mockNuxtImport("useI18n", () => useI18nMock);

let checkedServices = ref([]);

vi.mock("@/utils/services/services", () => ({
  services: [
    {
      name: "translate",
      purposes: ["essential"],
      required: true,
    },
    {
      name: "tracking",
      purposes: ["usage"],
    },
    {
      name: "media",
      purposes: ["thirdPartyContent", "socialMedia"],
    },
  ],
}));

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  useConsentManager: () => ({
    checkedServices,
  }),
}));

describe("components/Page/PageCookiesSection.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    checkedServices.value = [];
  });
  describe("label", () => {
    describe("when section is a purpose", () => {
      it("renders a checkbox for a service with correct label", () => {
        const wrapper = mount(PageCookiesSection, {
          global: {
            mocks: {
              $n: (num) => num,
            },
          },
          props: {
            serviceData: {
              name: "usage",
              services: [],
            },
          },
        });

        const label = wrapper.find("label");
        expect(label.text()).toContain("cookies.purposes.usage.title");
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
      });
    });

    describe("when section is a service", () => {
      it("renders a checkbox for a service with correct label", () => {
        const wrapper = mount(PageCookiesSection, {
          props: {
            serviceData: {
              name: "analytics",
            },
          },
        });

        const label = wrapper.find("label");
        expect(label.text()).toContain("cookies.services.analytics.title");
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
      });
    });

    describe("when section is a service with non translated label", () => {
      it("uses the service title", () => {
        useI18nMock.mockImplementation(() => ({
          fallbackLocale: "en",
          t: (key) => key,
          te: () => false,
        }));

        const wrapper = mount(PageCookiesSection, {
          props: {
            serviceData: {
              name: "analytics",
              title: "matomo",
            },
          },
        });

        const label = wrapper.find("label");
        expect(label.text()).toContain("matomo");
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
      });
    });
  });

  describe("when service is in checkedServices", () => {
    it("checkbox is checked ", () => {
      checkedServices.value = ["analytics"];
      const wrapper = mount(PageCookiesSection, {
        props: {
          serviceData: {
            name: "analytics",
          },
          show: [],
        },
      });

      const input = wrapper.find('input[type="checkbox"]');
      expect(input.element.checked).toBe(true);
    });
  });

  describe("when toggling the checkbox input", () => {
    it("updates checkedServices", () => {
      const wrapper = mount(PageCookiesSection, {
        props: {
          serviceData: {
            name: "analytics",
          },
          show: [],
        },
      });

      const input = wrapper.find('input[type="checkbox"]');
      input.setValue(true);

      expect(checkedServices.value).toContain("analytics");

      input.setValue(false);
      expect(checkedServices.value).not.toContain("analytics");
    });
  });

  it("applies indeterminate state for partially selected child services", async () => {
    checkedServices.value = ["video"];

    const wrapper = mount(PageCookiesSection, {
      global: {
        mocks: {
          $n: (num) => num,
        },
      },
      props: {
        serviceData: {
          name: "media",
          services: [{ name: "video" }, { name: "audio" }],
        },
        show: ["media"],
      },
    });

    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes("aria-checked")).toBe("mixed");
  });
});
