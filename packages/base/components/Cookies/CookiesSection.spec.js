import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import CookiesSection from "./CookiesSection.vue";

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

let acceptedServices = ref([]);

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
    acceptedServices,
  }),
}));

describe("components/Page/CookiesSection.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    acceptedServices.value = [];
  });
  describe("label", () => {
    describe("when section is a purpose", () => {
      it("renders a checkbox for a service with correct label", () => {
        const wrapper = mount(CookiesSection, {
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
        const wrapper = mount(CookiesSection, {
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

        const wrapper = mount(CookiesSection, {
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

  describe("when service is in acceptedServices", () => {
    it("checkbox is checked ", () => {
      acceptedServices.value = ["analytics"];
      const wrapper = mount(CookiesSection, {
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
      const wrapper = mount(CookiesSection, {
        props: {
          serviceData: {
            name: "analytics",
          },
          show: [],
        },
      });

      const input = wrapper.find('input[type="checkbox"]');
      input.setValue(true);

      expect(wrapper.vm.checkedServices).toContain("analytics");

      input.setValue(false);
      expect(wrapper.vm.checkedServices).not.toContain("analytics");
    });
  });

  it("applies indeterminate state for partially selected child services", async () => {
    acceptedServices.value = ["video"];

    const wrapper = mount(CookiesSection, {
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
