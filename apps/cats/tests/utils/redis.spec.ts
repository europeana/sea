import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRuntimeConfig } from "nitropack/runtime";

describe("@/utils/redis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("useRedisConnectionOptions", () => {
    it("returns connection options without TLS when tls.ca is not configured", async () => {
      vi.mocked(useRuntimeConfig).mockReturnValue({
        redis: {
          url: "redis://localhost:6379",
        },
      } as ReturnType<typeof useRuntimeConfig>);

      const { useRedisConnectionOptions } = await import("@/utils/redis");

      const options = useRedisConnectionOptions();

      expect(useRuntimeConfig).toHaveBeenCalledTimes(1);
      expect(options).toEqual({
        url: "redis://localhost:6379",
        maxRetriesPerRequest: null,
      });
      expect(options).not.toHaveProperty("tls");
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

      const { useRedisConnectionOptions } = await import("@/utils/redis");

      const options = useRedisConnectionOptions();

      expect(options).toEqual({
        url: "rediss://secure.redis.example.org:6380",
        maxRetriesPerRequest: null,
        tls: {
          ca: Buffer.from(base64Ca, "base64"),
        },
      });
    });

    it("omits url and tls when redis runtime config is missing", async () => {
      vi.mocked(useRuntimeConfig).mockReturnValue(
        {} as ReturnType<typeof useRuntimeConfig>,
      );

      const { useRedisConnectionOptions } = await import("@/utils/redis");

      const options = useRedisConnectionOptions();

      expect(options).toEqual({
        maxRetriesPerRequest: null,
      });
    });
  });
});
