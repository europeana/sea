import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import EULogo from "./EULogo.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "da" },
  }),
}));

vi.mock("@europeana/style/img/eu-funded/da-Funded by the EU_NEG.svg", () => ({
  default: "da-logo.svg",
}));

describe("EULogo", () => {
  it("renders an image with alt attribute", () => {
    const wrapper = shallowMount(EULogo);
    const img = wrapper.find("img");

    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toBe("footer.imageDescription");
  });
  it("renders the logo from the current locale", () => {
    const wrapper = shallowMount(EULogo);
    const img = wrapper.find("img");

    expect(img.attributes("src")).toBe("da-logo.svg");
  });
});
