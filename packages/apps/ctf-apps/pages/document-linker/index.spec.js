import { afterEach, describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import { init as initContentfulApp } from "@contentful/app-sdk";

import DocumentLinker from "./index.vue";

const mocks = vi.hoisted(() => {
  return {
    initContentfulApp: vi.fn(),
  };
});

vi.mock("@contentful/app-sdk", () => {
  return {
    init: mocks.initContentfulApp,
    locations: {
      LOCATION_ENTRY_FIELD: "field",
    },
  };
});

const url = "https://files.example.org/";
const sdk = {
  field: {
    getValue: vi.fn().mockReturnValue("stored value"),
    onValueChanged: vi.fn(),
    setValue: vi.fn(),
  },
  location: {
    is(location) {
      return location === "field";
    },
  },
  parameters: {
    instance: {
      url,
    },
  },
  window: {
    startAutoResizer: vi.fn(),
  },
};

vi.mocked(initContentfulApp).mockImplementation((callback) => callback(sdk));

const factory = () => shallowMount(DocumentLinker);

describe("pages/DocumentLinker/index.vue", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts the CTF SDK window auto resizer", () => {
    factory();

    expect(sdk.window.startAutoResizer).toHaveBeenCalledWith();
  });

  it("displays the URL from the instance parameter", async () => {
    const wrapper = factory();
    await nextTick();

    const text = wrapper.text();

    expect(text).toContain(url);
  });

  it("initialises the field value to that stored in CTF", () => {
    const wrapper = factory();

    const field = wrapper.vm.field;

    expect(field).toBe("stored value");
  });

  it("updates field value when value changes in CTF", () => {
    const wrapper = factory();
    const callback = sdk.field.onValueChanged.mock.calls[0][0];

    callback("new value");
    const field = wrapper.vm.field;

    expect(field).toBe("new value");
  });

  it("updates value in CTF when field value changes", async () => {
    const wrapper = factory();
    const input = wrapper.find("input");

    await input.setValue("new value");

    expect(sdk.field.setValue).toHaveBeenCalledWith("new value");
  });
});
