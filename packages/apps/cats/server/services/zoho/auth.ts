import { useRuntimeConfig } from "nitropack/runtime";

export const zohoAuth = {
  accessToken: null,

  async createAccessToken() {
    const config = useRuntimeConfig().zoho;

    const url = new URL("/oauth/v2/token", "https://accounts.zoho.eu");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("client_secret", config.clientSecret);
    url.searchParams.set("grant_type", "client_credentials");
    url.searchParams.set("scope", "ZohoCRM.modules.ALL,ZohoCRM.bulk.read");
    url.searchParams.set("soid", `ZohoCRM.${config.serviceOrgId}`);

    const response = await fetch(url, {
      method: "post",
    });

    if (!response.ok) {
      throw new Error(`Zoho oAuth request error: "${response.statusText}`);
    }

    const json = await response.json();

    return json["access_token"];
  },

  async useAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await this.createAccessToken();
    }
    return this.accessToken;
  },

  refreshAccessToken() {
    this.accessToken = null;
    return this.useAccessToken();
  },
};
