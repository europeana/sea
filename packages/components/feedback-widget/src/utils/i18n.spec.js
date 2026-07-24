import { describe, it, expect } from "vitest";

import { createI18n } from "./i18n.js";

describe("i18n", () => {
  const messages = {
    en: {
      pages: {
        home: {
          title: "Home (English)",
        },
      },
    },
    de: {
      pages: {
        home: {
          title: "Home (German)",
        },
      },
    },
  };

  it("gets the message for the current locale", () => {
    const i18n = createI18n({ locale: "en", messages });

    const message = i18n.t("pages.home.title");

    expect(message).toBe("Home (English)");
  });

  it("gets the message for a given locale", () => {
    const i18n = createI18n({ locale: "en", messages });

    const message = i18n.t("pages.home.title", "de");

    expect(message).toBe("Home (German)");
  });

  it("reverts to the fallback locale", () => {
    const i18n = createI18n({ locale: "fr", messages });

    const message = i18n.t("pages.home.title");

    expect(message).toBe("Home (English)");
  });
});
