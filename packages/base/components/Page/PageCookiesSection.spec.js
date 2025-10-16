import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import PageCookiesSection from "./PageCookiesSection.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      fallbackLocale: "en",
      t: (key) => key,
      te: () => true,
    };
  };
});

let checkedServices = ref([]);

vi.mock("@/utils/services/services", () => ({
  allServicesNames: ["translate", "tracking", "media"],
  essentialServicesNames: ["translate"],
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
  default: () => ({
    checkedServices,
  }),
}));

describe("components/Page/PageCookiesSection.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    checkedServices.value = [];
  });

  it("renders a checkbox for a service with correct label", () => {
    const wrapper = mount(PageCookiesSection, {
      props: {
        serviceData: {
          name: "analytics",
          title: "matomo",
          purposes: ["usage"],
        },
        show: [],
      },
    });

    const label = wrapper.find("label");
    expect(label.text()).toContain("cookies.services.analytics.title");
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
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
