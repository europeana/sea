import { describe, it, expect, vi } from "vitest";
import { useFetch } from "@vueuse/core";

import { useMapData } from "./mapData.js";
import { fixtures } from "@test/fixtures.js";

const mocks = vi.hoisted(() => {
  return {
    useFetch: vi.fn(),
  };
});

vi.mock("@vueuse/core", () => {
  return {
    useFetch: mocks.useFetch,
  };
});

vi.mocked(useFetch).mockReturnValue({
  json: vi.fn().mockResolvedValue({
    data: { value: fixtures.twoPointsFeatureCollection },
  }),
});

describe("@/composables/mapData.js", () => {
  describe("useMapData", () => {
    describe("data", () => {
      describe("when supplied `json` in arg", () => {
        const arg = {
          json: JSON.stringify(fixtures.onePointFeatureCollection),
        };

        it("uses parsed JSON for data value", () => {
          const { data } = useMapData(arg);

          expect(data.value).toEqual(fixtures.onePointFeatureCollection);
        });
      });

      describe("when supplied `url` in arg", () => {
        const arg = { url: fixtures.url };

        it("fetches GeoJSON from URL", async () => {
          const { data } = useMapData(arg);

          await new Promise(process.nextTick);

          expect(data.value).toEqual(fixtures.twoPointsFeatureCollection);
        });
      });

      describe("when supplied neither in arg", () => {
        const arg = {};

        it("throws an error", () => {
          let error;
          try {
            useMapData(arg);
          } catch (e) {
            error = e;
          }

          expect(error.message).toBe("No data JSON or URL supplied.");
        });
      });
    });

    describe("centre", () => {
      it("defaults to the co-ordinates of the centre point of Europe", () => {
        const arg = {
          json: JSON.stringify(fixtures.twoPointsFeatureCollection),
        };

        const { centre } = useMapData(arg);

        expect(centre.value).toEqual([9.254419, 50.102223]);
      });

      it("uses point co-ordinates if only one", () => {
        const arg = {
          json: JSON.stringify(fixtures.onePointFeatureCollection),
        };

        const { centre } = useMapData(arg);

        expect(centre.value).toEqual(
          fixtures.onePointFeatureCollection.features[0].geometry.coordinates,
        );
      });
    });
  });
});
