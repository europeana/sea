import { describe, it, expect, vi, beforeEach } from "vitest";
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
    return { data: ref(items), error: ref(null), status: ref("success") };
  }),
}));
mockNuxtImport("useAsyncData", () => useAsyncDataMock);

const showCollapse = vi.fn();
const toggleCollapse = vi.fn();
class Collapse {
  show() {
    showCollapse();
  }
  toggle() {
    toggleCollapse();
  }
}
mockNuxtImport("useNuxtApp", () => {
  return () => {
    return {
      $bs: {
        Collapse,
      },
    };
  };
});
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
  beforeEach(() => {
    vi.resetAllMocks();
  });

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
        stubs: { SmartLink: { template: "<a><slot /></a>" } },
      },
    });

    expect(wrapper.find(".file-link a").text()).toEqual(
      "Europeana Advocacy Framework.doc",
    );
    expect(wrapper.find(".file-info").text()).toEqual(
      "145.41 kB • added numeric",
    );
  });

  describe("when there is no data fetched", () => {
    it("items is an empty array", async () => {
      const wrapper = factory();

      wrapper.vm.data = undefined;
      expect(wrapper.vm.items).toEqual([]);
    });
  });

  it("sets accordion and collapse ids from unique instance id", async () => {
    const wrapper = factory();

    expect(wrapper.findAll("#document-browser-v-0").length).toBe(1);
    expect(wrapper.findAll("#document-browser-v-0-collapse-0").length).toBe(1);
  });

  describe("when select prop is set to true", () => {
    it("renders a radio input for each item and associates the button or link as label", async () => {
      const wrapper = factory({ props: { select: true } });

      expect(wrapper.findAll(".form-check-input").length).toBe(2);
      expect(
        wrapper.findAll(".form-check-input")[0].attributes("aria-labelledby"),
      ).toBe("document-browser-v-0-label-0");
      expect(wrapper.find("#document-browser-v-0-label-0").exists()).toBe(true);
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
    it("shows a message the content is empty", () => {
      useAsyncDataMock.mockImplementation(() => ({
        data: ref(null),
        error: ref(new Error()),
        status: ref("error"),
      }));
      const wrapper = factory();

      expect(wrapper.text()).toEqual("documentBrowser.empty");
    });
  });

  describe("when an accordian toggle button is clicked", () => {
    describe("and the item had not yet been opened", () => {
      it("adds the item to the 'opened' ref, dus not toggle the collapse", () => {
        const wrapper = factory();

        wrapper.find(".accordion-button").trigger("click");

        expect(wrapper.vm.opened).toContain(
          "https://files.example.org/Advocacy/",
        );
        expect(toggleCollapse).not.toHaveBeenCalled();
      });
    });
    describe("and the item had already been opened", () => {
      it("toggles the collapse instance", async () => {
        const wrapper = factory();

        wrapper.find(".accordion-button").trigger("click");
        expect(toggleCollapse).not.toHaveBeenCalled();

        // Subsequent click
        wrapper.find(".accordion-button").trigger("click");
        expect(toggleCollapse).toHaveBeenCalled();
      });
    });
  });

  describe("when a nested document browser's content has been fetched", () => {
    it("toggles the collapse instance", async () => {
      const collapseId = "document-browser-v-0-collapse-0";
      const wrapper = factory();

      wrapper.vm.handleFetched(collapseId);
      await nextTick();

      expect(showCollapse).toHaveBeenCalled();
    });
  });

  describe("when content is fetched with success or error", () => {
    it("emits the fetched event", async () => {
      const wrapper = factory();

      wrapper.vm.status = "error";
      await nextTick();

      expect(wrapper.emitted("fetched").length).toBe(1);

      wrapper.vm.status = "success";
      await nextTick();

      expect(wrapper.emitted("fetched").length).toBe(2);
    });
  });

  describe("when content is fetched with another state", () => {
    it("doesn NOT emit the fetched event", async () => {
      const wrapper = factory();

      wrapper.vm.status = "pending";
      await nextTick();

      expect(wrapper.emitted("fetched")).toBeFalsy();
    });
  });
});
