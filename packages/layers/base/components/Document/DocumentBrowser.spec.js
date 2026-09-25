import { describe, it, expect, vi } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

import DocumentBrowser from "./DocumentBrowser.vue";

mockNuxtImport("useI18n", () => () => ({
  t: (key, slot) => `${key} ${slot.date}`,
  te: () => true,
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

const { useAsyncDataMock } = vi.hoisted(() => ({
  useAsyncDataMock: vi.fn(() => {
    return { data: ref(items), error: ref(null) };
  }),
}));
mockNuxtImport("useAsyncData", () => useAsyncDataMock);

const url = "https://files.example.org/";

const factory = ({ data, props } = {}) =>
  shallowMount(DocumentBrowser, {
    data() {
      return {
        ...data,
      };
    },
    props: {
      url,
      ...props,
    },
  });

describe("components/Generic/DocumentBrowser", () => {
  it("renders an accordian with directory as accordion header and file", () => {
    const wrapper = factory();

    expect(wrapper.find(".accordion").exists()).toBe(true);
    expect(wrapper.find(".accordion-header").exists()).toBe(true);
    expect(wrapper.find(".file-link").exists()).toBe(true);
  });

  it("renders the file size and numeric added date", () => {
    const wrapper = mount(DocumentBrowser, {
      props: {
        url,
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

  describe("when there is no data fetched", () => {
    it("items is an empty array", async () => {
      const wrapper = factory();

      wrapper.vm.data = undefined;
      expect(wrapper.vm.items).toEqual([]);
    });
  });

  describe("when there are subdirectories", () => {
    it("sets accordion and collapse ids per nesting level", async () => {
      const wrapper = factory();
      expect(wrapper.findAll("#document-browser").length).toBe(1);
      expect(wrapper.findAll("#collapse-Advocacy").length).toBe(1);

      await wrapper.find(".accordion-button").trigger("click");
      expect(wrapper.find("document-browser-stub").attributes("idsuffix")).toBe(
        "-Advocacy",
      );

      const wrapper1 = factory({ props: { idSuffix: "-Base" } });
      expect(wrapper1.findAll("#document-browser-Base").length).toBe(1);
      expect(wrapper1.findAll("#collapse-Base-Advocacy").length).toBe(1);

      await wrapper1
        .find("#document-browser-Base .accordion-button")
        .trigger("click");
      expect(
        wrapper1.find("document-browser-stub").attributes("idsuffix"),
      ).toBe("-Base-Advocacy");
    });
  });

  describe("when select prop is set to true", () => {
    it("renders a radio input for each item and associates the button or link as label", async () => {
      const wrapper = factory({ props: { select: true } });

      expect(wrapper.findAll(".form-check-input").length).toBe(2);
      expect(
        wrapper.findAll(".form-check-input")[0].attributes("aria-labelledby"),
      ).toBe("label-Advocacy");
      expect(wrapper.find("#label-Advocacy").exists()).toBe(true);
    });
  });

  describe("when the v-model specifies a nested path", () => {
    const model = `${url}dir/subdir/report.pdf`;

    it("opens the accordion for the next-level parent path", async () => {
      const wrapper = factory({ data: { model } });

      await nextTick();

      expect(wrapper.vm.opened).toContain(`${url}dir/`);
    });
  });

  describe("when fetching from the URL errors", () => {
    it("shows a message the content is not found", () => {
      useAsyncDataMock.mockImplementation(() => ({
        data: ref(null),
        error: ref(new Error()),
      }));
      const wrapper = factory();

      expect(wrapper.text()).toEqual("documentBrowser.notFound");
    });
  });
});
