import fetch from "node-fetch-native";

import { zohoAuth } from "./auth";

export const zohoFetch = async (
  url: string,
  {
    method = "get",
    headers,
    body,
    params,
  }: { body?: string; headers?: object; method?: string; params?: object } = {},
) => {
  let accessToken = await zohoAuth.useAccessToken();

  const fetchUrl = new URL(url, "https://www.zohoapis.eu");
  if (params) {
    for (const key in params) {
      fetchUrl.searchParams.set(key, params[key]);
    }
  }

  const fetchWithAuth = () =>
    fetch(fetchUrl, {
      method,
      headers: {
        authorization: `Zoho-oauthtoken ${accessToken}`,
        ...headers,
      },
      body,
    });

  let response = await fetchWithAuth();

  if (!response.ok) {
    if (response.status === 401) {
      const json = await response.json();
      if (json.code === "INVALID_TOKEN") {
        accessToken = await zohoAuth.refreshAccessToken();
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
