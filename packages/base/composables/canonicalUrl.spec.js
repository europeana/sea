import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import useCanonicalUrl from "./canonicalUrl.js";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {}),
}));
mockNuxtImport("useRoute", () => useRouteMock);

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      baseUrl: "https://www.example.eu",
    },
  });
});

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: ref("en"),
    };
  };
});

describe("useCanonicalUrl", () => {
  afterEach(() => {
    useRouteMock.mockReset();
  });

  it("returns URLs for a localised path with query", () => {
    useRouteMock.mockImplementation(() => ({
      path: "/en/news",
      fullPath: "/en/news?tag=data",
    }));

    const result = useCanonicalUrl();

    expect(result.urlWithBothLocaleAndQuery.value).toBe(
      "https://www.example.eu/en/news?tag=data",
    );
    expect(result.urlWithOnlyQuery.value).toBe(
      "https://www.example.eu/news?tag=data",
    );
    expect(result.urlWithOnlyLocale.value).toBe(
      "https://www.example.eu/en/news",
    );
    expect(result.urlWithNeitherLocaleNorQuery.value).toBe(
      "https://www.example.eu/news",
    );
  });

  it("returns URLs for the root path correctly", () => {
    useRouteMock.mockImplementation(() => ({
      path: "/en",
      fullPath: "/en?filter=something",
    }));

    const result = useCanonicalUrl();

    expect(result.urlWithBothLocaleAndQuery.value).toBe(
      "https://www.example.eu/en?filter=something",
    );
    expect(result.urlWithOnlyQuery.value).toBe(
      "https://www.example.eu?filter=something",
    );
    expect(result.urlWithOnlyLocale.value).toBe("https://www.example.eu/en");
    expect(result.urlWithNeitherLocaleNorQuery.value).toBe(
      "https://www.example.eu",
    );
  });

  it("returns URLs for a path without locale correctly", () => {
    useRouteMock.mockImplementation(() => ({
      path: "/about",
      fullPath: "/about?filter=something",
    }));

    const result = useCanonicalUrl();

    expect(result.urlWithBothLocaleAndQuery.value).toBe(
      "https://www.example.eu/about?filter=something",
    );
    expect(result.urlWithOnlyQuery.value).toBe(
      "https://www.example.eu/about?filter=something",
    );
    expect(result.urlWithOnlyLocale.value).toBe("https://www.example.eu/about");
    expect(result.urlWithNeitherLocaleNorQuery.value).toBe(
      "https://www.example.eu/about",
    );
  });
});
