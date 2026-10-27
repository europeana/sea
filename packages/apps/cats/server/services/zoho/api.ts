import fetch from "node-fetch-native";

import { createZohoAccessToken } from "./auth";

let accessToken: string | null = null;

export const zohoFetch = async (
  url: string,
  {
    method = "get",
    headers,
    body,
    params,
  }: { body?: string; headers?: object; method?: string; params?: object } = {},
) => {
  // TODO: make base URL configurable
  const resource = new URL(url, "https://www.zohoapis.eu");
  if (params) {
    for (const key in params) {
      resource.searchParams.set(key, params[key]);
    }
  }

  const fetchWithAuth = async () => {
    if (!accessToken) {
      accessToken = await createZohoAccessToken();
    }
    const requestInit: RequestInit = {
      method,
      headers: {
        authorization: `Zoho-oauthtoken ${accessToken}`,
        ...headers,
      },
    };
    if (body) {
      requestInit.body = body;
    }

    return fetch(resource, requestInit);
  };

  let response = await fetchWithAuth();

  if (!response.ok) {
    if (response.status === 401) {
      const json = await response.json();
      if (json.code === "INVALID_TOKEN") {
        // clear the access token so a new one is requested
        // TODO: this should be using the refresh token
        accessToken = null;
        response = await fetchWithAuth();
      }
    }

    // if neither response is ok, error out
    if (!response.ok) {
      throw new Error(`Zoho CRM API request error: "${response.status}`);
    }
  }

  return response;
};
