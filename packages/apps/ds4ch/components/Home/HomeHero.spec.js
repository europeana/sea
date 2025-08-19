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
          heroImage: { image: { url: "https://www.europeana.eu/example.jpg" } },
        });

        expect(wrapper.vm.imageCSSVars).toBeTruthy();
      });
    });
  });
});
