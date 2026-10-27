import { vi } from "vitest";

vi.mock("bullmq", () => ({
  FlowProducer: vi.fn(
    class {
      add = vi.fn();
    },
  ),
  Queue: vi.fn(
    class {
      add = vi.fn();
    },
  ),
}));

const mockContentfulManagementEnvironment = {
  createEntry: vi.fn(),
  createAssetWithId: vi.fn(),
  createUpload: vi.fn(),
  getAsset: vi.fn(),
  getContentType: vi.fn(),
  getEntries: vi.fn(),
  getEntry: vi.fn(),
};
vi.mock("contentful-management", () => ({
  default: vi.fn(() => ({
    createClient: vi.fn(() => ({
      getSpace: vi.fn(() => ({
        getEnvironment: vi.fn(() => mockContentfulManagementEnvironment),
      })),
    })),
  })),
}));

vi.mock("h3", () => ({
  defineEventHandler: vi.fn((callback) => callback),
  readBody: vi.fn(),
  setResponseStatus: vi.fn(),
}));

vi.mock("ioredis", () => ({
  default: vi.fn(class {}),
}));

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn().mockReturnValue({ redis: {} }),
}));

vi.mock("node-fetch-native", () => ({
  default: vi.fn(),
}));
