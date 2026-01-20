import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ContentCard from "./ContentCard.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
    };
  };
});

const testProps = {
  title: "The Milkmaid by Vermeer",
};

const factory = (props = testProps) =>
  shallowMount(ContentCard, {
    props,
  });

describe("components/content/ContentCard", () => {
  describe("template", () => {
    describe("card title", () => {
      it("is displayed as-is if a string", () => {
        const wrapper = factory();

        const title = wrapper.find('[data-qa="content card"] .card-title');
        expect(title.text()).toBe("The Milkmaid by Vermeer");
      });
    });

    describe("card subtitle", () => {
      describe("for news", () => {
        const urls = [
          "https://www.europeana.eu/en/news/introducing-the-new-europeana-demo",
          {
            name: "news___en",
            params: { pathMatch: "introducing-the-new-europeana-demo" },
          },
        ];

        for (const url of urls) {
          it(`is shown for ${JSON.stringify(url)}`, () => {
            const wrapper = factory({ ...testProps, url });

            const subtitle = wrapper.find(
              '[data-qa="content card"] .card-subtitle',
            );

            expect(subtitle.text()).toBe("news");
          });
        }
      });

      describe("for projects", () => {
        const urls = [
          "https://www.europeana.eu/en/project/pioneers",
          { name: "project___en", params: { exhibition: "pioneers" } },
        ];

        for (const url of urls) {
          it(`is shown for ${JSON.stringify(url)}`, () => {
            const wrapper = factory({ ...testProps, url });

            const subtitle = wrapper.find(
              '[data-qa="content card"] .card-subtitle',
            );

            expect(subtitle.text()).toBe("project");
          });
        }
      });
    });

    describe("card text", () => {
      it("displays the text", () => {
        const textProp = "Painting by Vermeer";
        const wrapper = factory({
          ...testProps,
          text: textProp,
        });

        const text = wrapper.find('[data-qa="content card"] .card-text');
        expect(text.text()).toBe(textProp);
      });

      it("truncates long text", () => {
        const wrapper = factory({
          ...testProps,
          text: "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
        });

        const text = wrapper.find('[data-qa="content card"] .card-text');
        expect(text.text().length).toBe(256);
        expect(text.text().endsWith("…")).toBe(true);
      });
    });
  });

  describe("card link", () => {
    it("may have a link", () => {
      const wrapper = factory({ ...testProps, url: "https://example.org" });

      const link = wrapper.find('[data-qa="content card"] smart-link-stub');
      expect(link.exists()).toBe(true);
    });
  });

  describe("card image", () => {
    it("may have an image", () => {
      const imageUrl = "https://example.org/img.webp";
      const wrapper = factory({ ...testProps, imageUrl });

      const image = wrapper.find(
        '[data-qa="content card"] .card-img image-optimised-stub',
      );
      expect(image).toBeDefined();
      expect(image.attributes("src")).toBe(imageUrl);
    });

    it("removes the image if the image media is not found", async () => {
      const wrapper = factory({
        ...testProps,
        imageUrl: "https://example.org/img.webp",
      });

      let image = wrapper.find(
        '[data-qa="content card"] .card-img image-optimised-stub',
      );
      expect(image.exists()).toBe(true);
      await image.trigger("error");

      image = wrapper.find(
        '[data-qa="content card"] .card-img image-optimised-stub',
      );
      expect(image.exists()).toBe(false);
    });
  });

  describe("methods", () => {
    describe("imageNotFound", () => {
      it("sets imageFound to false", () => {
        const imageUrl = "http://example.org/image.jpeg";
        const wrapper = factory({ ...testProps, imageUrl });

        expect(wrapper.vm.imageFound).toBe(true);
        wrapper.vm.imageNotFound();

        expect(wrapper.vm.imageFound).toBe(false);
      });
    });
  });
});
