import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import gql from "graphql-tag";
import fetch from "node-fetch-native";

import VueContentfulGraphql from "./index.js";

const config = {
  accessToken: {
    delivery: "access",
  },
  environmentId: "test",
  graphQlOrigin: "https://graphql.example.org",
  spaceId: "space",
};

describe("VueContentfulGraphql", () => {
  beforeAll(() => {
    vi.mock("node-fetch-native", () => {
      return {
        default: vi
          .fn()
          .mockResolvedValue({ json: () => Promise.resolve({ data: {} }) }),
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

  describe("query", () => {
    afterAll(() => {
      vi.unstubAllGlobals();
    });

    const query = `
query Page($url: String!) {
  PageCollection(url: $url) {
    items {
      name
    }
  }
}
    `.trim();
    const ast = gql`
      ${query}
    `;

    it("queries the Contentful GraphQL endpoint with supplied query and variables", async () => {
      const app = { prototype: {} };
      const variables = { url: "/" };
      VueContentfulGraphql.install(app, config);

      await app.prototype.$contentful.query(ast, variables);

      expect(fetch).toHaveBeenCalledWith(
        `${config.graphQlOrigin}/content/v1/spaces/${config.spaceId}/environments/${config.environmentId}?_query=Page&url=%2F`,
        {
          body: JSON.stringify({
            query,
            variables,
          }),
          headers: {
            authorization: `Bearer ${config.accessToken.delivery}`,
            "content-type": "application/json",
          },
          method: "post",
        },
      );
    });
  });
});
