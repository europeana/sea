// QUESTION: use @vue/apollo-composable instead?

import fetch from "node-fetch-native";
import httpError from "http-errors";
import qs from "qs";
import { print as printGraphql } from "graphql/language/printer.js";

// TODO: ensure presence of required config
export const query = async (ast, variables = {}, config = {}) => {
  const origin = config.graphqlUrl || "https://graphql.contentful.com";
  const path = `/content/v1/spaces/${config.spaceId}/environments/${config.environmentId || "master"}`;

  const accessToken = variables.preview
    ? config.accessToken?.preview
    : config.accessToken?.delivery;

  const url = new URL(`${origin}${path}`);

  // These params will go into the URL query which will not be used by the
  // GraphQL service itself as it's a POST request, but facilitate intermediary
  // caching based on the URL alone, as with the apicache module.
  url.search = qs.stringify(
    {
      _query: ast?.definitions?.[0]?.name?.value,
      ...variables,
    },
    { arrayFormat: "repeat" },
  );

  const query = printGraphql(ast);

  const body = JSON.stringify({
    query,
    variables,
  });

  const headers = {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
  };

  const method = "post";
  const response = await fetch(url.toString(), {
    body,
    headers,
    method,
  });

  if (!response.ok) {
    throw httpError(response.status);
  }

  const json = await response.json();

  return json;
};
