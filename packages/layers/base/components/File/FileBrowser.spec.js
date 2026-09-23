import { describe, it, expect } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

import FileBrowser from "./FileBrowser.vue";

mockNuxtImport("useI18n", () => () => ({
  t: (key, slot) => `${key} ${slot.date}`,
  d: (key, format) => format,
}));

const items = [
  {
    name: "Advocacy",
    type: "directory",
    mtime: "Thu, 23 May 2024 14:26:05 GMT",
    items: [
      {
        name: "2016 Update to copyright mandate",
        type: "directory",
        mtime: "Mon, 27 Jul 2020 13:31:14 GMT",
        items: [
          {
            name: "cwgsubgroupreviewingthecopyrightmandatebriefv1.pdf",
            type: "file",
            mtime: "Mon, 11 Sep 2023 23:20:04 GMT",
            size: 70725,
          },
        ],
      },
    ],
  },
  {
    name: "Europeana Advocacy Framework.doc",
    type: "file",
    mtime: "Mon, 11 Sep 2023 23:20:04 GMT",
    size: 145408,
  },
];

mockNuxtImport("useAsyncData", () => () => {
  return { data: ref(items), error: ref(null) };
});

const factory = (props) =>
  shallowMount(FileBrowser, {
    props: {
      url: "https://files.example.org/",
      ...props,
    },
  });

describe("components/Generic/FileBrowser", () => {
  it("renders an accordian with directory as accordion header and file", () => {
    const wrapper = factory();

    expect(wrapper.find(".accordion").exists()).toBe(true);
    expect(wrapper.find(".accordion-header").exists()).toBe(true);
    expect(wrapper.find(".file-link").exists()).toBe(true);
  });

  it("renders the file size and numeric added date", () => {
    const wrapper = mount(FileBrowser, {
      props: {
        url: "https://files.example.org/",
      },
      global: {
        stubs: ["RouterLink"],
      },
    });

    expect(wrapper.find(".file-link a").text()).toEqual(
      "Europeana Advocacy Framework.doc (145.41 kB) (newWindow)",
    );
    expect(wrapper.find(".date-added").text()).toEqual("added numeric");
  });

  describe("when there are subdirectories", () => {
    it("sets numbered accordion and collapse ids per nesting level", async () => {
      const wrapper = factory();

      expect(wrapper.findAll("#file-browser-0").length).toBe(1);
      expect(wrapper.findAll("#collapse-0-0").length).toBe(1);

      await wrapper.find(".accordion-button").trigger("click");
      expect(wrapper.find("file-browser-stub").attributes("level")).toBe("1");

      const wrapper1 = factory({ level: 1 });

      expect(wrapper1.findAll("#file-browser-1").length).toBe(1);
      expect(wrapper1.findAll("#collapse-0-1").length).toBe(1);

      await wrapper1.find("#file-browser-1 .accordion-button").trigger("click");
      expect(wrapper1.find("file-browser-stub").attributes("level")).toBe("2");
    });
  });

  describe("when there is no data fetched", () => {
    it("items is an empty array", async () => {
      const wrapper = factory();

      wrapper.vm.data = undefined;
      expect(wrapper.vm.items).toEqual([]);
    });
  });
});
