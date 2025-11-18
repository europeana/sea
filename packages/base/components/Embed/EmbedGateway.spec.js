import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { mount } from "@vue/test-utils";
import EmbedGateway from "./EmbedGateway";

const { useI18nMock } = vi.hoisted(() => ({
  useI18nMock: vi.fn(() => {
    return {
      t: (key) => key,
      te: () => true,
    };
  }),
}));

mockNuxtImport("useI18n", () => useI18nMock);

let consentRequired = ref(true);
let acceptedServices = ref([]);
const acceptOnly = vi.fn();

vi.mock("@europeana/sea-base-layer/composables/consentManager", () => ({
  useConsentManager: () => ({
    acceptOnly,
    consentRequired,
    acceptedServices,
  }),
}));

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
      schemes: ["https://vimeo.com/*"],
    },
    {
      name: "other",
      purposes: ["thirdPartyContent", "other"],
    },
  ],
}));

const vimeoEmbedCode = `'<iframe src="https://vimeo.com/embed/123" width="500" height="400"></iframe>'`;
const factory = (
  props = {
    embedCode: vimeoEmbedCode,
  },
) =>
  mount(EmbedGateway, {
    attachTo: document.body,
    props,
    slots: { default: '<div class="embed"/>' },
    global: {
      stubs: {
        "client-only": { template: "<div><slot /></div>" },
        "i18n-t": { template: "<div><slot /></div>" },
        CookiesModal: true,
        SmartLink: true,
      },
    },
  });

describe("components/Embed/EmbedGateway", () => {
  beforeEach(() => {
    acceptedServices.value = [];
    consentRequired.value = true;
  });

  describe("when provider has user consent", () => {
    it("renders the embed", async () => {
      acceptedServices.value = ["vimeo"];
      const wrapper = factory();

      const notification = wrapper.find(".notification-overlay");
      const embed = wrapper.find(".embed");

      expect(notification.exists()).toBe(false);
      expect(embed.isVisible()).toBe(true);
    });
  });

  describe("when provider does not have consent", () => {
    it("renders a notification overlay", () => {
      const wrapper = factory();

      const notification = wrapper.find(".notification-overlay");

      expect(notification.isVisible()).toBe(true);
    });
  });

  describe("on before mount", () => {
    describe("when an embed code is passed", () => {
      describe("which contains an iframe", () => {
        it("sets the provider url to it's src and the width and height", () => {
          const iframeEmbedCode =
            '<iframe src="https://sketchfab.com/models/1234/embed" width="500" height="400"></iframe>';

          const wrapper = factory({ embedCode: iframeEmbedCode });

          expect(wrapper.vm.iframe.height).toEqual("400px");
          expect(wrapper.vm.iframe.width).toEqual("500px");
          expect(wrapper.vm.providerUrl).toEqual(
            "https://sketchfab.com/models/1234/embed",
          );
        });
      });

      describe("which contains a script", () => {
        it("sets the provider url to it's src", () => {
          const scriptEmbedCode =
            '<script async src="//www.instagram.com/embed.js"></script>';

          const wrapper = factory({ embedCode: scriptEmbedCode });

          expect(wrapper.vm.providerUrl).toEqual(
            "http://www.instagram.com/embed.js",
          );
        });
      });

      describe("which does not contains a script or iframe", () => {
        it("opens the gate", () => {
          const audioEmbedCode =
            '<audio src="https://www.example.eu/audio.mp3"></audio>';

          const wrapper = factory({ embedCode: audioEmbedCode });

          expect(wrapper.vm.opened).toBe(true);
        });
      });
    });
  });

  describe("when clicking the load all embedded content button", () => {
    describe("consent preferences for all website services is required", () => {
      it("checks all third party services to display as checked in the cookie modal and opens modal", async () => {
        const wrapper = factory();

        wrapper.find(".accept-all-button").trigger("click");
        await nextTick();

        expect(wrapper.vm.modalModel).toEqual(["bsky", "vimeo", "other"]);
        expect(wrapper.vm.renderModal).toBe(true);
      });
    });
    describe("consent preferences for all website services has been previously saved", () => {
      it("accepts all third party services", () => {
        consentRequired.value = false;
        const wrapper = factory();

        wrapper.find(".accept-all-button").trigger("click");

        expect(acceptOnly).toBeCalledWith(["bsky", "vimeo", "other"]);
      });
    });
  });

  describe("when clicking the accept only this provider button", () => {
    describe("consent preferences for all website services is required", () => {
      it("checks current provider to display as checked in the cookie modal and opens modal", async () => {
        const wrapper = factory();

        wrapper.find(".accept-only-button").trigger("click");
        await nextTick();

        expect(wrapper.vm.modalModel).toEqual(["vimeo"]);
        expect(wrapper.vm.renderModal).toBe(true);
      });
    });
    describe("consent preferences for all website services has been previously saved", () => {
      it("accepts the current provider service", () => {
        consentRequired.value = false;
        const wrapper = factory();

        wrapper.find(".accept-only-button").trigger("click");

        expect(acceptOnly).toBeCalledWith(["vimeo"]);
      });
    });
  });

  describe("when provider URL is not supported", () => {
    it("does not load the embed and renders a notification to inform the user", async () => {
      const iframeUnknownEmbedCode =
        '<iframe title="title" src="https://unknown-embed-provider.eu/1234/embed" width="500" height="400"></iframe>';
      const wrapper = factory({ embedCode: iframeUnknownEmbedCode });

      const notification = wrapper.find(".unsupported-content-notification");

      expect(notification.isVisible()).toBe(true);
      expect(wrapper.vm.opened).toBe(false);
    });
  });

  describe("closeModal", () => {
    it("unmounts the embed modal", async () => {
      const wrapper = factory();
      wrapper.vm.renderModal = true;

      expect(wrapper.vm.renderModal).toBe(true);

      wrapper.vm.closeModal();

      expect(wrapper.vm.renderModal).toBe(false);
    });
  });
});
