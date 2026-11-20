import { vi } from "vitest";

vi.mock("bullmq", () => ({
  FlowProducer: vi.fn(
    class {
      add = vi.fn();
      addBulk = vi.fn();
    },
  ),
  Job: vi.fn(class {}),
  Queue: vi.fn(
    class {
      add = vi.fn();
      getJob = vi.fn();
    },
  ),
  Worker: vi.fn(),
}));

vi.mock("contentful-management", () => {
  const mockEntry = {
    sys: { id: "entryid" },
    fields: {},
  };

  const mockClient = {
    asset: {
      create: vi.fn(),
      createWithId: vi.fn(),
      get: vi.fn(),
      processForAllLocales: vi.fn(),
      publish: vi.fn(),
    },
    contentType: {
      get: vi.fn(),
    },
    entry: {
      create: vi.fn().mockResolvedValue(mockEntry),
      get: vi.fn().mockResolvedValue(mockEntry),
      getMany: vi.fn(),
      publish: vi.fn(),
      update: vi.fn(),
    },
    upload: {
      create: vi.fn(),
    },
  };

  const mockCreateClient = vi.fn(() => mockClient);

  return {
    createClient: mockCreateClient,
    default: {
      createClient: mockCreateClient,
    },
  };
});

vi.mock("h3", () => ({
  defineEventHandler: vi.fn((callback) => callback),
  getRequestHeader: vi.fn(),
  readBody: vi.fn(),
  setResponseStatus: vi.fn(),
}));

vi.mock("nitropack/runtime", () => ({
  defineNitroPlugin: vi.fn((callback) => callback),
  useRuntimeConfig: vi.fn().mockReturnValue({ redis: {} }),
}));

vi.mock("node-fetch-native", () => ({
  default: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      body: null,
      json: () => Promise.resolve(null),
      ok: true,
      status: 200,
    });
  }),
}));
