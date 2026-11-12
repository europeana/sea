import { describe, expect, it, vi } from "vitest";

import VueContentfulGraphql from "./index.js";

const config = {
  accessToken: {
    delivery: "access",
  },
  environmentId: "test",
  graphqlUrl: "https://graphql.example.org",
  spaceId: "space",
};

describe("VueContentfulGraphql", () => {
  describe("install", () => {
    describe("when vue version is < 3", () => {
      const app = { prototype: {}, version: "2.7.16" };

      it("injects $contentful onto app prototype for global availability", () => {
        VueContentfulGraphql.install(app, config);

        expect(typeof app.prototype.$contentful.query).toBe("function");
      });
    });

    describe("when vue version is > 3", () => {
      const app = { provide: vi.fn(), version: "3.0.0" };

      it("injects $contentful onto app for global injection", () => {
        VueContentfulGraphql.install(app, config);

        expect(app.provide).toHaveBeenCalledWith(
          "$contentful",
          expect.objectContaining({
            query: expect.any(Function),
          }),
        );
      });
    });
  });
});
