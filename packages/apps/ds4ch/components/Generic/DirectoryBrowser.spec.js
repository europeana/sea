import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import DirectoryBrowser from "./DirectoryBrowser.vue";

const factory = (props) =>
  shallowMount(DirectoryBrowser, {
    props: {
      directories: [
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
            {
              name: "Europeana Advocacy Framework.doc",
              type: "file",
              mtime: "Mon, 11 Sep 2023 23:20:04 GMT",
              size: 145408,
            },
          ],
        },
      ],
      ...props,
    },
  });
describe("components/Generic/DirectoryBrowser", () => {
  it("renders an accordian", () => {
    const wrapper = factory();

    expect(wrapper.find(".accordion").exists()).toBe(true);
  });
  describe("when there are subdirectories", () => {
    it("sets numbered accordion and collapse ids per nesting level", () => {
      const wrapper = factory();

      expect(wrapper.findAll("#directory-browser-0").length).toBe(1);
      expect(wrapper.findAll("#collapse-0-0").length).toBe(1);
      expect(wrapper.find("directory-browser-stub").attributes("level")).toBe(
        "1",
      );

      const wrapper1 = factory({ level: 1 });

      expect(wrapper1.findAll("#directory-browser-1").length).toBe(1);
      expect(wrapper1.findAll("#collapse-0-1").length).toBe(1);
      expect(wrapper1.find("directory-browser-stub").attributes("level")).toBe(
        "2",
      );
    });
  });
});
