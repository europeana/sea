// TODO: move to own workspace package @europeana/zoho

import fetch from "node-fetch-native";

import { createZohoAccessToken } from "./auth";
import { createZohoCRMClient } from "./crm";

// TODO: supply config as arg, i.e. rm use of useRuntimeConfig from service impl
export const createZohoAPIClient = () => {
  let accessToken: string | null = null;
  let crm;

  return {
    get accessToken() {
      return accessToken;
    },
    set accessToken(value) {
      accessToken = value;
    },
    async authenticate() {
      if (!this.authenticated) {
        this.accessToken = await createZohoAccessToken();
      }
    },
    get authenticated() {
      return !!this.accessToken;
    },
    get crm() {
      crm ||= createZohoCRMClient(this);
      return crm;
    },
    async fetch(resource: string | URL, requestInit: RequestInit) {
      await this.authenticate();

      return fetch(resource, {
        ...requestInit,
        headers: {
          authorization: `Zoho-oauthtoken ${this.accessToken}`,
          ...requestInit.headers,
        },
      });
    },
    async request(
      url: string,
      {
        method = "get",
        headers,
        body,
        params,
      }: {
        body?: string;
        headers?: HeadersInit;
        method?: string;
        params?: object;
      } = {},
    ) {
      // TODO: make base URL configurable
      const resource = new URL(url, "https://www.zohoapis.eu");
      if (params) {
        for (const key in params) {
          resource.searchParams.set(key, params[key]);
        }
      }

      const requestInit: RequestInit = {
        method,
        headers,
      };
      if (body) {
        requestInit.body = body;
      }

      let response = await this.fetch(resource, requestInit);

      if (!response.ok) {
        if (response.status === 401) {
          const json = await response.json();
          if (json.code === "INVALID_TOKEN") {
            // clear the access token so a new one is requested
            // TODO: this should be using the refresh token
            this.accessToken = null;
            response = await this.fetch(resource, requestInit);
          }
        }

        // if neither response is ok, error out
        if (!response.ok) {
          throw new Error(`Zoho CRM API request error: ${response.status}`);
        }
      }

      return response;
    },
  };
};
