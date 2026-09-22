import { afterEach, describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { init as initContentfulApp } from "@contentful/app-sdk";

import DisabledSingleLine from "./index.vue";

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

const sdk = {
  field: {
    getValue: vi.fn().mockReturnValue("stored value"),
    onValueChanged: vi.fn(),
  },
  location: {
    is(location) {
      return location === "field";
    },
  },
  window: {
    startAutoResizer: vi.fn(),
  },
};

vi.mocked(initContentfulApp).mockImplementation((callback) => callback(sdk));

const factory = () => shallowMount(DisabledSingleLine);

describe("pages/disabled-single-line/index.vue", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts the CTF SDK window auto resizer", () => {
    factory();

    expect(sdk.window.startAutoResizer).toHaveBeenCalledWith();
  });

  it("initialises the field value to that stored in CTF", () => {
    const wrapper = factory();

    const field = wrapper.vm.field;

    expect(field).toBe("stored value");
  });

  it("does not permit editing through the UI", () => {
    const wrapper = factory();

    const input = wrapper.find("input");

    expect(input.isDisabled()).toBe(true);
  });
});
