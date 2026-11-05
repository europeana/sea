import { ZohoAuthConfig, ZohoOAuthTokenResponse } from "./types.js";

export const createZohoAccessToken = async (
  config: ZohoAuthConfig,
): Promise<string> => {
  const url = new URL(
    "/oauth/v2/token",
    config.url || "https://accounts.zoho.eu",
  );
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("client_secret", config.clientSecret);
  // TODO: mv to params
  url.searchParams.set("grant_type", "client_credentials");
  // TODO: mv to params
  url.searchParams.set("scope", "ZohoCRM.modules.ALL,ZohoCRM.bulk.read");
  url.searchParams.set("soid", `ZohoCRM.${config.serviceOrgId}`);

  const response = await fetch(url, {
    method: "post",
  });

  if (!response.ok) {
    throw new Error(`Zoho oAuth request error: ${response.statusText}`);
  }

  const json = (await response.json()) as ZohoOAuthTokenResponse;

  return json["access_token"];
};
