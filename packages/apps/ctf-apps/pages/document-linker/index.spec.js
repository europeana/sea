import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

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
    getValue: vi.fn(),
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
  it("starts the CTF SDK window auto resizer", () => {
    factory();

    expect(sdk.window.startAutoResizer).toHaveBeenCalledWith();
  });
});
