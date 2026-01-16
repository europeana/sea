import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import CookiesWidget from "./CookiesWidget.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
    };
  };
});

const hideToast = vi.fn();
class Toast {
  hide() {
    hideToast();
  }
  show() {}
}
mockNuxtImport("useNuxtApp", () => {
  return () => {
    return {
      $bs: {
        Toast,
      },
    };
  };
});

const consentRequired = ref(true);
const consentSaved = ref(false);
const acceptAll = vi.fn();
const rejectAll = vi.fn();

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  useConsentManager: () => ({
    acceptAll,
    rejectAll,
    consentRequired,
    consentSaved,
  }),
}));

describe("components/Cookies/CookiesWidget.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    consentRequired.value = true;
    consentSaved.value = false;
  });

  it("renders a toast", () => {
    const wrapper = shallowMount(CookiesWidget);

    expect(wrapper.find(".toast").exists()).toBe(true);
  });

  it("does not render a toast if consent is not required", () => {
    consentRequired.value = false;
    const wrapper = shallowMount(CookiesWidget);

    expect(wrapper.find(".toast").exists()).toBe(false);
  });

  it("calls acceptAll on Accept button click", () => {
    const wrapper = shallowMount(CookiesWidget);

    wrapper.find("button.btn-success").trigger("click");

    expect(acceptAll).toHaveBeenCalled();
  });

  it("calls rejectAll on Decline button click", () => {
    const wrapper = shallowMount(CookiesWidget);

    wrapper.find("button.btn-outline-primary").trigger("click");

    expect(rejectAll).toHaveBeenCalled();
  });

  describe("when clicking the learn more button", () => {
    it("renders the modal and hides the toast", () => {
      const wrapper = shallowMount(CookiesWidget);

      // FIXME: this causes vitest to report an unhandled error,
      //        something to do with LazyCookiesModal
      wrapper.find("button.btn-link").trigger("click");

      expect(wrapper.vm.renderModal).toBe(true);
      expect(hideToast).toHaveBeenCalled();
    });
  });

  describe("when consent is required and not yet saved", () => {
    it("renders text", () => {
      const wrapper = shallowMount(CookiesWidget);

      expect(wrapper.vm.text).toEqual("cookies.consentNotice.text");
    });
  });

  describe("when consent is required and saved", () => {
    it("renders updated text", () => {
      // FIXME: this causes vitest to report an unhandled error,
      //        something to do with LazyCookiesModal
      consentSaved.value = true;
      const wrapper = shallowMount(CookiesWidget);

      expect(wrapper.vm.text).toEqual("cookies.consentNotice.textUpdated");
    });
  });

  describe("closeModalAndShowToast", () => {
    describe("when consent still required", () => {
      it("unmounts the modal and shows toast ", () => {
        const wrapper = shallowMount(CookiesWidget);
        wrapper.vm.toastInstance.show = vi.fn();
        wrapper.vm.renderModal = true;

        expect(wrapper.vm.renderModal).toBe(true);

        wrapper.vm.closeModalAndShowToast();

        expect(wrapper.vm.renderModal).toBe(false);
        expect(wrapper.vm.toastInstance.show).toHaveBeenCalled();
      });
    });

    describe("when consent no longer required", () => {
      it("unmounts the modal and does not show toast ", () => {
        const wrapper = shallowMount(CookiesWidget);
        wrapper.vm.toastInstance.show = vi.fn();
        consentRequired.value = false;

        wrapper.vm.closeModalAndShowToast();

        expect(wrapper.vm.renderModal).toBe(false);
        expect(wrapper.vm.toastInstance.show).not.toHaveBeenCalled();
      });
    });
  });
});
