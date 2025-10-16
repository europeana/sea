import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PageCookiesModal from "./PageCookiesModal.vue";

let consentRequired = ref(true);
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
      name: "media",
      purposes: ["thirdPartyContent", "socialMedia"],
    },
  ],
}));

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  default: () => ({
    acceptAll,
    rejectAll,
    consentRequired,
  }),
}));
const factory = () =>
  mount(PageCookiesModal, {
    global: {
      stubs: {
        "i18n-t": true,
        PageCookiesSection: true,
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
    const sections = wrapper.findAll("page-cookies-section-stub");

    expect(sections.length).toBe(3);
  });

  it("toggles display sections via toggleDisplay method", async () => {
    const wrapper = factory();

    expect(wrapper.vm.show).toContain("thirdPartyContent");

    wrapper.vm.toggleDisplay("thirdPartyContent");
    expect(wrapper.vm.show).not.toContain("thirdPartyContent");

    wrapper.vm.toggleDisplay("usage");
    expect(wrapper.vm.show).toContain("usage");
  });
});
