import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BlogAuthor from "./BlogAuthor.vue";

const name = "Blog Writer";
const url = "https://www.example/eu/writer";
const organisation = "Museum of fine arts";

describe("components/Blog/BlogAuthor", () => {
  describe("when there is a url", () => {
    it("renders the name as a link", () => {
      const wrapper = shallowMount(BlogAuthor, {
        props: { name, url },
      });

      const link = wrapper.find("smart-link-stub");

      expect(link.exists()).toBe(true);
    });
  });
  describe("when there is no url", () => {
    it("renders the name as a span", () => {
      const wrapper = shallowMount(BlogAuthor, {
        props: { name },
      });

      const link = wrapper.find("smart-link-stub");
      const template = wrapper.find("address");

      expect(link.exists()).toBe(false);
      expect(template.text()).toContain(name);
    });
  });
  describe("when there is an organisation", () => {
    it("renders it", () => {
      const wrapper = shallowMount(BlogAuthor, {
        props: { name, organisation },
      });

      const template = wrapper.find("address");

      expect(template.text()).toContain(name);
      expect(template.text()).toContain(organisation);
    });
  });
});
