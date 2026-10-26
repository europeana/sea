import fetch from "node-fetch-native";
import { useRuntimeConfig } from "nitropack/runtime";
import { parse as parseContentDisposition } from "content-disposition";
import { Readable } from "node:stream";

export type ZohoBulkReadCriteria = {
  field: {
    api_name: string;
  };
  comparator: string;
  value: Array<string> | string;
};

export type ZohoContactRecord = {
  id: string;
  Full_Name: string;
  LinkedIn: string;
  Contact_Participation: Array<string>;
  Title: string;
  Public_email: string;
};

const auth = {
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

export const fetchZoho = async (
  url: string,
  {
    method = "get",
    headers,
    body,
    params,
  }: { body?: string; headers?: object; method?: string; params?: object } = {},
) => {
  let accessToken = await auth.useAccessToken();

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
        accessToken = await auth.refreshAccessToken();
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

export const createZohoBulkReadJob = async (criteria: ZohoBulkReadCriteria) => {
  const config = useRuntimeConfig().zoho;

  const method = "post";
  const url = "/crm/bulk/v8/read";
  const headers = {
    "content-type": "application/json",
  };
  const body = {
    query: {
      module: {
        api_name: "Contacts",
      },
      fields: [
        "id",
        "Full_Name",
        "Public_email",
        "LinkedIn",
        "Contact_Participation",
        "Title",
        "Modified_Time",
      ],
      criteria,
    },
  };
  if (config.bulkReadCallbackUrl) {
    body.callback = {
      method: "post",
      url: config.bulkReadCallbackUrl,
    };
  }

  const response = await fetchZoho(url, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  const json = await response.json();

  return json;
};

export const fetchZohoBulkReadJobResult = async (
  id: string,
): Promise<Readable | null> => {
  const url = `/crm/bulk/v8/read/${id}/result`;

  const response = await fetchZoho(url);

  if (!response.body) {
    return null;
  }

  return Readable.fromWeb(response.body);
};

export const fetchZohoContact = async (
  id: string,
): Promise<ZohoContactRecord | null> => {
  // TODO: should this go into args?
  const params = {
    fields: "id,Full_Name,Public_email,LinkedIn,Contact_Participation,Title",
  };
  const response = await fetchZoho(`/crm/v8/Contacts/${id}`, { params });

  if (!response.body) {
    return null;
  }

  const json = await response.json();

  return json.data[0];
};

export const fetchZohoPhoto = async (
  id: string,
): Promise<{
  file: Readable;
  contentType?: string;
  fileName?: string;
} | null> => {
  const response = await fetchZoho(`/crm/v8/Contacts/${id}/photo`);

  if (!response.body) {
    return null;
  }

  const file = Readable.fromWeb(response.body);
  const contentType = response.headers.get("content-type")?.split(";")?.[0];
  const fileName = parseContentDisposition(
    response.headers.get("content-disposition") || "",
  )?.parameters?.filename;

  return {
    file,
    contentType,
    fileName,
  };
};
