import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import CookiesModal from "./CookiesModal.vue";

let consentRequired = ref(true);
let acceptedServices = ref([]);
const acceptAll = vi.fn();
const rejectAll = vi.fn();

vi.mock("@/utils/services/services", () => ({
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
  useConsentManager: () => ({
    acceptAll,
    rejectAll,
    consentRequired,
    acceptedServices,
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

const scrollToSelector = vi.fn();
vi.mock("@/composables/scrollTo.js", () => ({
  default: () => ({
    scrollToSelector,
  }),
}));

const factory = (props) =>
  mount(CookiesModal, {
    props,
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

describe("components/Page/CookiesModal.vue", () => {
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

  describe("when modal hide event is triggered", () => {
    it('emits "closeModal"', async () => {
      const wrapper = factory();

      const modal = wrapper.find(".modal");
      const event = new Event("hide.bs.modal");
      modal.element.dispatchEvent(event);

      expect(wrapper.emitted("closeModal")).toBeTruthy();
    });
  });

  it("renders a section per purpose group", () => {
    const wrapper = factory();
    const sections = wrapper.findAllComponents({
      name: "CookiesSection",
    });

    expect(sections.length).toBe(15);
  });

  describe("when only certain purpose groups should display", () => {
    it("renders only the purposes listed in displayPurposes", () => {
      const wrapper = factory({ displayPurposes: ["usage"] });

      const sections = wrapper.findAllComponents({
        name: "CookiesSection",
      });
      expect(wrapper.vm.groupedSections.length).toBe(1);
      expect(wrapper.vm.groupedSections[0].name).toBe("usage");
      expect(sections.length).toBe(2);
    });
  });

  it("toggles display sections via toggleDisplay method", async () => {
    const wrapper = factory();
    const sectionInstance = wrapper.findComponent({
      name: "CookiesSection",
    }).vm;

    expect(wrapper.vm.show).toContain("thirdPartyContent");

    sectionInstance.$emit("toggle", "thirdPartyContent");
    expect(wrapper.vm.show).not.toContain("thirdPartyContent");

    sectionInstance.$emit("toggle", "usage");
    expect(wrapper.vm.show).toContain("usage");
  });

  describe("the scrollTo prop is passed", () => {
    it("scrolls to the third party content section", () => {
      const sectionId = "#cookie-modal-consentcheckbox-thirdPartyContent";
      const wrapper = factory({ scrollTo: sectionId });
      const modalEl = wrapper.vm.$refs.modal;
      modalEl.focus = vi.fn();

      const modal = wrapper.find(".modal");
      const showEvent = new Event("show.bs.modal");
      modal.element.dispatchEvent(showEvent);

      const transitionEndEvent = new Event("transitionend");

      modalEl.dispatchEvent(transitionEndEvent);

      expect(modalEl.focus).toHaveBeenCalled();
      expect(scrollToSelector).toHaveBeenCalledWith(sectionId, {
        behavior: "smooth",
        container: modalEl,
      });
    });
  });
});
