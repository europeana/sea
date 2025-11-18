// QUESTION: use @vue/apollo-composable instead?

import fetch from "node-fetch-native";
import { print as printGraphql } from "graphql/language/printer.js";

const responseHasItems = (response) => {
  let hasItems = false;
  for (const collection in response.data) {
    if (response.data[collection]?.items?.length > 0) {
      hasItems = true;
      break;
    }
  }
  return hasItems;
};

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
  url.search = new URLSearchParams({
    _query: ast?.definitions?.[0]?.name?.value,
    ...variables,
  }).toString();

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

  const json = await response.json();

  return new Promise((resolve, reject) => {
    if (json.errors && !responseHasItems(json)) {
      reject(json.errors[0]);
    }
    resolve(json || {});
  });
};
