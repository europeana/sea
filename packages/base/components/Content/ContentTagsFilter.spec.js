import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentTagsFilter from "./ContentTagsFilter.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const categoriesContentfulResponse = {
  data: {
    categoryCollection: {
      items: [
        { identifier: "3d", name: "3D" },
        { identifier: "cooking", name: "cooking" },
        { identifier: "postcards", name: "postcards" },
      ],
    },
  },
};

const factory = async () =>
  await mountSuspended(ContentTagsFilter, {
    global: {
      provide: {
        $contentful: {
          query: () => categoriesContentfulResponse,
        },
      },
    },
  });

describe("components/Content/contentTagsFilter", () => {
  it("fetches categories from Contentful", async () => {
    const wrapper = await factory();
    expect(wrapper.vm.tags.value.length).toBe(3);
  });
});
