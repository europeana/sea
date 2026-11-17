import { describe, it, expect, vi, beforeEach } from "vitest";
import Redis from "ioredis";
import { useRuntimeConfig } from "nitropack/runtime";

describe("@/utils/redis", () => {
  const mockRedisInstance = {
    status: "ready",
    quit: vi.fn(),
  } as unknown as Redis;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(Redis).mockImplementation(function () {
      return mockRedisInstance;
    });
  });

  it("initialises a Redis connection without TLS when tls.ca is not configured", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      redis: {
        url: "redis://localhost:6379",
      },
    } as ReturnType<typeof useRuntimeConfig>);

    const { useRedisConnection } = await import("@/utils/redis");

    const connection = useRedisConnection();

    expect(useRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(Redis).toHaveBeenCalledTimes(1);
    expect(Redis).toHaveBeenCalledWith("redis://localhost:6379", {
      maxRetriesPerRequest: null,
      tls: undefined,
    });
    expect(connection).toBe(mockRedisInstance);
  });

  it("decodes base64 TLS CA certificate when redis.tls.ca is provided", async () => {
    const rawPem =
      "-----BEGIN CERTIFICATE-----\nFAKECERT\n-----END CERTIFICATE-----";
    const base64Ca = Buffer.from(rawPem).toString("base64");

    vi.mocked(useRuntimeConfig).mockReturnValue({
      redis: {
        url: "rediss://secure.redis.example.org:6380",
        tls: {
          ca: base64Ca,
        },
      },
    } as ReturnType<typeof useRuntimeConfig>);

    const { useRedisConnection } = await import("@/utils/redis");

    const connection = useRedisConnection();

    expect(Redis).toHaveBeenCalledWith(
      "rediss://secure.redis.example.org:6380",
      {
        maxRetriesPerRequest: null,
        tls: {
          ca: Buffer.from(base64Ca, "base64"),
        },
      },
    );
    expect(connection).toBe(mockRedisInstance);
  });

  it("caches the Redis connection across subsequent calls", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      redis: {
        url: "redis://localhost:6379",
      },
    } as ReturnType<typeof useRuntimeConfig>);

    const { useRedisConnection } = await import("@/utils/redis");

    const first = useRedisConnection();
    const second = useRedisConnection();

    expect(first).toBe(second);
    expect(useRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(Redis).toHaveBeenCalledTimes(1);
  });

  it("passes undefined URL and undefined TLS when redis runtime config is missing", async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue(
      {} as ReturnType<typeof useRuntimeConfig>,
    );

    const { useRedisConnection } = await import("@/utils/redis");

    const connection = useRedisConnection();

    expect(Redis).toHaveBeenCalledWith(undefined, {
      maxRetriesPerRequest: null,
      tls: undefined,
    });
    expect(connection).toBe(mockRedisInstance);
  });
});
