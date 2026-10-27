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

vi.mock("contentful-management", () => {
  const mockEnvironment = {
    createEntry: vi.fn(),
    createAssetWithId: vi.fn(),
    createUpload: vi.fn(),
    getAsset: vi.fn(),
    getContentType: vi.fn(),
    getEntries: vi.fn(),
    getEntry: vi.fn(),
  };
  const mockGetEnvironment = vi.fn(() => mockEnvironment);
  const mockGetSpace = vi.fn(() => ({
    getEnvironment: mockGetEnvironment,
  }));
  const mockCreateClient = vi.fn(() => ({
    getSpace: mockGetSpace,
  }));

  return {
    default: {
      createClient: mockCreateClient,
    },
  };
});

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
  default: vi.fn().mockResolvedValue({
    body: null,
    json: vi.fn().mockResolvedValue(null),
    ok: true,
    status: 200,
  }),
}));
