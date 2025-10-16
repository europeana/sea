import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import HomeHero from "./HomeHero.vue";

const factory = (propsData) =>
  shallowMount(HomeHero, {
    propsData,
  });

describe("components/home/HomeHero", () => {
  describe("imageCSSVars computed property", () => {
    describe("when there is a hero image available", () => {
      it("returns background style definitions", () => {
        const wrapper = factory({
          headline: "hero title",
          heroImage: { image: { url: "https://www.europeana.eu/example.jpg" } },
        });

        expect(wrapper.vm.imageCSSVars).toBeTruthy();
      });
    });
  });

  describe("europeana logo", () => {
    it("exists and links to europeana.eu", () => {
      const wrapper = factory({
        headline: "hero title",
        heroImage: { image: { url: "https://www.europeana.eu/example.jpg" } },
      });
      const logoLink = wrapper.find("#europeana-logo a");
      expect(logoLink.attributes("href")).toEqual("https:/www.europeana.eu");
    });
  });
});
