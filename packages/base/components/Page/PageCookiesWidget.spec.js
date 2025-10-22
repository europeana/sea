import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PageCookiesWidget from "./PageCookiesWidget.vue";

let consentRequired = ref(true);
const acceptAll = vi.fn();
const rejectAll = vi.fn();

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  useConsentManager: () => ({
    acceptAll,
    rejectAll,
    consentRequired,
  }),
}));

describe("components/Page/PageCookiesWidget.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    consentRequired.value = true;
  });

  it("renders a toast", () => {
    const wrapper = shallowMount(PageCookiesWidget);

    expect(wrapper.find(".toast").exists()).toBe(true);
  });

  it("does not render a toast if consent is not required", () => {
    consentRequired.value = false;
    const wrapper = shallowMount(PageCookiesWidget);

    expect(wrapper.find(".toast").exists()).toBe(false);
  });

  it("calls acceptAll on Accept button click", () => {
    const wrapper = shallowMount(PageCookiesWidget);

    wrapper.find("button.btn-success").trigger("click");

    expect(acceptAll).toHaveBeenCalled();
  });

  it("calls rejectAll on Decline button click", () => {
    const wrapper = shallowMount(PageCookiesWidget);

    wrapper.find("button.btn-outline-primary").trigger("click");

    expect(rejectAll).toHaveBeenCalled();
  });
});
