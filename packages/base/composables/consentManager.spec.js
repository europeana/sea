import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import useConsentManager from "./consentManager";

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

describe("useConsentManager", () => {
  afterEach(() => {
    useCookieMock.mockReset();
  });

  const essentialCookie = "auth";
  const analyticsCookie = "analytics";
  const mediaCookie = "media";
  const essential = [essentialCookie];
  const all = [...essential, analyticsCookie, mediaCookie];

  describe("when there is no consent cookie set", () => {
    it("returns consentRequired is true", () => {
      const { consentRequired } = useConsentManager(essential, all);

      expect(consentRequired.value).toBe(true);
    });
  });

  describe("when there is already a consent cookie set", () => {
    it("returns consentRequired to false and returns saved preferences as expected", () => {
      useCookieMock.mockImplementation(() => ({
        value: `${essentialCookie},${mediaCookie}`,
      }));
      const { consentRequired, isServiceAccepted } = useConsentManager(
        essential,
        all,
      );

      expect(consentRequired.value).toBe(false);
      expect(isServiceAccepted(mediaCookie)).toBe(true);
    });
  });

  it("saves full consent on acceptAll", () => {
    const { acceptAll, isServiceAccepted } = useConsentManager(essential, all);

    acceptAll();

    expect(isServiceAccepted(analyticsCookie)).toBe(true);
    expect(isServiceAccepted(mediaCookie)).toBe(true);
    expect(isServiceAccepted(essentialCookie)).toBe(true);
  });

  it("saves only essential on rejectAll", () => {
    const { rejectAll, isServiceAccepted } = useConsentManager(essential, all);

    rejectAll();

    expect(isServiceAccepted(essentialCookie)).toBe(true);
    expect(isServiceAccepted(analyticsCookie)).toBe(false);
  });

  it("saves specific services (and essential) on acceptOnly", () => {
    const { acceptOnly, isServiceAccepted } = useConsentManager(essential, all);

    acceptOnly([analyticsCookie]);

    expect(isServiceAccepted(essentialCookie)).toBe(true);
    expect(isServiceAccepted(analyticsCookie)).toBe(true);
    expect(isServiceAccepted(mediaCookie)).toBe(false);
  });

  describe("when accepted services are updated", () => {
    describe("and Matomo is accepted", () => {
      it("calls matomo to set it's cookie", async () => {
        const matomoCookie = ["matomo"];
        const { acceptOnly } = useConsentManager(matomoCookie);

        acceptOnly(matomoCookie);
        await nextTick();

        expect(rememberMatomoSpy).toHaveBeenCalled();
      });
    });
    describe("and Matomo is NOT accepted", () => {
      it("calls matomo to remove it's cookie", async () => {
        const { rejectAll } = useConsentManager(essential, all);

        rejectAll();
        await nextTick();

        expect(forgetMatomoSpy).toHaveBeenCalled();
      });
    });
  });
});
