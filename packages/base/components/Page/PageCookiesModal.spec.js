import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import PageCookiesModal from "./PageCookiesModal.vue";

let consentRequired = ref(true);
let acceptedServices = ref([]);
let checkedServices = ref([]);
const acceptAll = vi.fn();
const rejectAll = vi.fn();

vi.mock("@/utils/services/services", () => ({
  allServicesNames: ["translate", "analytics", "media"],
  essentialServicesNames: ["translate"],
  services: [
    {
      name: "translate",
      purposes: ["essential"],
      required: true,
    },
    {
      name: "analytics",
      purposes: ["usage"],
    },
    {
      name: "bsky",
      purposes: ["thirdPartyContent", "socialMedia"],
    },
    {
      name: "vimeo",
      purposes: ["thirdPartyContent", "mediaViewing", "video"],
    },
    {
      name: "other",
      purposes: ["thirdPartyContent", "other"],
    },
  ],
}));

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  default: () => ({
    acceptAll,
    rejectAll,
    consentRequired,
    acceptedServices,
    checkedServices,
  }),
}));

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      fallbackLocale: "en",
      t: (key) => key,
      te: () => true,
    };
  };
});
const factory = () =>
  mount(PageCookiesModal, {
    global: {
      mocks: {
        $n: (num) => num,
      },
      stubs: {
        "i18n-t": true,
        Teleport: { template: "<div><slot /></div>" },
      },
    },
  });

describe("components/Page/PageCookiesModal.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders a modal", () => {
    const wrapper = factory();

    expect(wrapper.find(".modal").exists()).toBe(true);
  });

  it("calls acceptAll on Accept button click", () => {
    const wrapper = factory();

    wrapper.find("button.btn-success").trigger("click");

    expect(acceptAll).toHaveBeenCalled();
  });

  it("calls rejectAll on Decline button click", () => {
    const wrapper = factory();

    wrapper.find("button.btn-outline-primary").trigger("click");

    expect(rejectAll).toHaveBeenCalled();
  });

  describe("when modal show event is triggered", () => {
    it('resets checked services to accepted services"', async () => {
      acceptedServices.value = ["translate"];
      checkedServices.value = ["translate", "analytics"];

      const wrapper = factory();

      const modal = wrapper.find(".modal");
      const event = new Event("show.bs.modal");
      modal.element.dispatchEvent(event);

      expect(checkedServices.value).toEqual(acceptedServices.value);
    });
  });

  describe("when modal hide event is triggered", () => {
    it('emits "showToast"', async () => {
      const wrapper = factory();

      const modal = wrapper.find(".modal");
      const event = new Event("hide.bs.modal");
      modal.element.dispatchEvent(event);

      expect(wrapper.emitted("showToast")).toBeTruthy();
    });
  });

  it("renders a section per purpose group", () => {
    const wrapper = factory();
    const sections = wrapper.findAllComponents({
      name: "PageCookiesSection",
    });

    expect(sections.length).toBe(15);
  });

  it("toggles display sections via toggleDisplay method", async () => {
    const wrapper = factory();
    const sectionInstance = wrapper.findComponent({
      name: "PageCookiesSection",
    }).vm;

    expect(wrapper.vm.show).toContain("thirdPartyContent");

    sectionInstance.$emit("toggle", "thirdPartyContent");
    expect(wrapper.vm.show).not.toContain("thirdPartyContent");

    sectionInstance.$emit("toggle", "usage");
    expect(wrapper.vm.show).toContain("usage");
  });
});
