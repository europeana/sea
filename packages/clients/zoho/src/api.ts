import { createZohoAccessToken } from "./auth.js";
import { ZohoCRMClient } from "./crm.js";
import { ZohoAPIErrorResponse, ZohoAuthConfig } from "./types.js";

export class ZohoAPIClient {
  private _accessToken: string | null = null;
  private _crm: ZohoCRMClient | null = null;
  private readonly _config: ZohoAuthConfig;

  constructor(config: ZohoAuthConfig) {
    this._config = config;
  }

  get accessToken() {
    return this._accessToken;
  }

  set accessToken(value) {
    this._accessToken = value;
  }

  async authenticate() {
    if (!this.authenticated) {
      this.accessToken = await createZohoAccessToken(this._config);
    }
  }

  get authenticated() {
    return !!this.accessToken;
  }

  get crm() {
    this._crm ||= new ZohoCRMClient(this);
    return this._crm;
  }

  async fetch(
    resource: string | URL,
    requestInit: RequestInit,
  ): Promise<Response> {
    await this.authenticate();

    return fetch(resource, {
      ...requestInit,
      headers: {
        authorization: `Zoho-oauthtoken ${this.accessToken}`,
        ...requestInit.headers,
      },
    });
  }

  async request(
    url: string,
    {
      method = "get",
      headers,
      body,
      params,
    }: {
      body?: RequestInit["body"];
      headers?: { [key: string]: string };
      method?: string;
      params?: { [key: string]: string };
    } = {},
  ): Promise<Response> {
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
        const json = (await response.json()) as ZohoAPIErrorResponse;
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
  }
}

export const createZohoAPIClient = (config: ZohoAuthConfig) =>
  new ZohoAPIClient(config);
