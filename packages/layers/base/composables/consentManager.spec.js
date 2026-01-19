import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createConsentManager } from "./consentManager";

const rememberMatomoSpy = vi.fn();
const forgetMatomoSpy = vi.fn();

mockNuxtImport("useMatomo", () => {
  return () => ({
    matomo: ref({
      rememberCookieConsentGiven: rememberMatomoSpy,
      forgetCookieConsentGiven: forgetMatomoSpy,
    }),
  });
});

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      cookieConsent: {
        maxAge: 1000,
      },
    },
  });
});

const { useCookieMock } = vi.hoisted(() => ({
  useCookieMock: vi.fn(() => ({ value: null })),
}));
mockNuxtImport("useCookie", () => useCookieMock);

describe("consent manager", () => {
  const essentialCookie = "auth";
  const analyticsCookie = "analytics";
  const mediaCookie = "media";
  const essential = [essentialCookie];
  const all = [...essential, analyticsCookie, mediaCookie];
  const config = { services: { essential, all } };

  afterEach(() => {
    useCookieMock.mockReset();
  });

  describe("when there is no consent cookie set", () => {
    it("returns consentRequired is true", () => {
      const { consentRequired } = createConsentManager(config);

      expect(consentRequired.value).toBe(true);
    });
  });

  describe("when there is already a consent cookie set", () => {
    describe("and services are unchanged", () => {
      it("returns consentRequired to false, consentSaved to true, and returns saved preferences as expected", () => {
        useCookieMock.mockImplementation(() => ({
          value: {
            [essentialCookie]: true,
            [mediaCookie]: true,
            [analyticsCookie]: false,
          },
        }));
        const { consentRequired, consentSaved, isServiceAccepted } =
          createConsentManager(config);

        expect(consentRequired.value).toBe(false);
        expect(consentSaved.value).toBe(true);
        expect(isServiceAccepted(mediaCookie)).toBe(true);
      });
    });

    describe("and new services were added", () => {
      it("returns consentRequired to true", () => {
        const configWithNewService = {
          services: { essential: [...essential], all: [...all] },
        };
        configWithNewService.services.all.push("other");

        useCookieMock.mockImplementation(() => ({
          value: {
            [essentialCookie]: true,
            [mediaCookie]: true,
            [analyticsCookie]: false,
          },
        }));
        const { consentRequired, consentSaved, isServiceAccepted } =
          createConsentManager(configWithNewService);

        expect(consentRequired.value).toBe(true);
        expect(consentSaved.value).toBe(true);
        expect(isServiceAccepted(mediaCookie)).toBe(true);
      });
    });
  });

  it("saves full consent on acceptAll", () => {
    const { acceptAll, isServiceAccepted } = createConsentManager(config);

    acceptAll();

    expect(isServiceAccepted(analyticsCookie)).toBe(true);
    expect(isServiceAccepted(mediaCookie)).toBe(true);
    expect(isServiceAccepted(essentialCookie)).toBe(true);
  });

  it("saves only essential on rejectAll", () => {
    const { rejectAll, isServiceAccepted } = createConsentManager(config);

    rejectAll();

    expect(isServiceAccepted(essentialCookie)).toBe(true);
    expect(isServiceAccepted(analyticsCookie)).toBe(false);
  });

  it("saves specific services (and essential) on acceptOnly", () => {
    const { acceptOnly, isServiceAccepted } = createConsentManager(config);

    acceptOnly([analyticsCookie]);

    expect(isServiceAccepted(essentialCookie)).toBe(true);
    expect(isServiceAccepted(analyticsCookie)).toBe(true);
    expect(isServiceAccepted(mediaCookie)).toBe(false);
  });

  describe("when accepted services are updated", () => {
    describe("and there is a handleCallbacks function in the config", () => {
      it("calls handleCallbacks", async () => {
        const handleCallbacks = vi.fn();

        const { acceptAll } = createConsentManager({
          services: { essential, all, handleCallbacks },
        });

        acceptAll();
        await nextTick();

        expect(handleCallbacks).toHaveBeenCalled();
      });
    });
  });

  describe("when consent cookie value changes", () => {
    it("gets and stores the consent preferences as saved in the updated cookie value", async () => {
      const cookieValue = ref({
        [essentialCookie]: true,
        [mediaCookie]: false,
        [analyticsCookie]: false,
      });

      useCookieMock.mockImplementation(() => cookieValue);

      const { isServiceAccepted } = createConsentManager(config);

      expect(isServiceAccepted(analyticsCookie)).toBe(false);
      expect(isServiceAccepted(mediaCookie)).toBe(false);

      cookieValue.value = {
        [essentialCookie]: true,
        [mediaCookie]: true,
        [analyticsCookie]: true,
      };

      await nextTick();

      expect(isServiceAccepted(analyticsCookie)).toBe(true);
      expect(isServiceAccepted(mediaCookie)).toBe(true);
    });
  });
});
