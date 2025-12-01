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

import { query } from "./query.js";

const config = {
  accessToken: {
    delivery: "access",
  },
  environmentId: "test",
  graphqlUrl: "https://graphql.example.org",
  spaceId: "space",
};

describe("query", () => {
  beforeAll(() => {
    vi.mock("node-fetch-native", () => {
      return {
        default: vi
          .fn()
          .mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: {} }),
          }),
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const graphqlQuery = `
query Page($url: String!) {
  PageCollection(url: $url) {
    items {
      name
    }
  }
}
  `.trim();
  const ast = gql`
    ${graphqlQuery}
  `;

  it("queries the Contentful GraphQL endpoint with supplied query and variables", async () => {
    const variables = { url: "/" };

    await query(ast, variables, config);

    expect(fetch).toHaveBeenCalledWith(
      `${config.graphqlUrl}/content/v1/spaces/${config.spaceId}/environments/${config.environmentId}?_query=Page&url=%2F`,
      {
        body: JSON.stringify({
          query: graphqlQuery,
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
