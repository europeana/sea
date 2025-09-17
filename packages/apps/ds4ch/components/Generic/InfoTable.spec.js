import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import InfoTable from "./InfoTable.vue";

describe("components/Generic/InfoTable", () => {
  it("renders the row content depending on its contents", () => {
    const wrapper = shallowMount(InfoTable, {
      props: {
        tableData: [
          {
            label: "Entry 1",
            url: "https://www.example.eu",
            icon: "example",
            value: "Value 1",
          },
          {
            label: "Entry 2",
            value: "Value 2",
          },
        ],
      },
    });

    const row1 = wrapper.findAll("tr")[0];
    const row2 = wrapper.findAll("tr")[1];

    expect(row1.find("smart-link-stub").exists()).toBe(true);
    expect(row2.find("smart-link-stub").exists()).toBe(false);
    expect(row2.find("span").exists()).toBe(true);
  });
});
