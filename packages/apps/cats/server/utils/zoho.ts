import fetch from "node-fetch-native";
import { useRuntimeConfig } from "nitropack/runtime";
import { parse as parseContentDisposition } from "content-disposition";
import { Readable } from "node:stream";

const createAccessToken = async () => {
  const config = useRuntimeConfig().zoho;

  if (config.accessToken) {
    return config.accessToken;
  }

  const url = new URL("/oauth/v2/token", "https://accounts.zoho.eu");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("client_secret", config.clientSecret);
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("scope", "ZohoCRM.modules.ALL");
  url.searchParams.set("soid", `ZohoCRM.${config.serviceOrgId}`);

  const response = await fetch(url, {
    method: "post",
  });

  if (!response.ok) {
    throw new Error(`Zoho oAuth request error: "${response.statusText}`);
  }

  const json = await response.json();

  return json["access_token"];
};

type ZohoContactRecord = {
  id: string;
  Full_Name: string;
  LinkedIn: string;
  Contact_Participation: Array<string>;
  Title: string;
  Public_email: string;
};

export const fetchZohoContact = async (
  id: string,
): Promise<ZohoContactRecord> => {
  // TODO: reuse access tokens
  // TODO: refresh when expired
  const accessToken = await createAccessToken();

  const url = new URL(`/crm/v8/Contacts/${id}`, "https://www.zohoapis.eu");
  url.searchParams.set(
    "fields",
    "id,Full_Name,Public_email,LinkedIn,Contact_Participation,Title",
  );

  const response = await fetch(url, {
    method: "get",
    headers: {
      authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Zoho CRM API contact request error: "${response.statusText}`,
    );
  }
  if (!response.body) {
    throw new Error(`Zoho CRM API contact not found for ID "${id}"`);
  }

  const json = await response.json();

  return json.data[0];
};

export const fetchZohoPhoto = async (
  id: string,
): Promise<{
  file: Readable;
  contentType: string;
  fileName: string;
}> => {
  // TODO: reuse access tokens
  // TODO: refresh when expired
  const accessToken = await createAccessToken();

  const url = new URL(
    `/crm/v8/Contacts/${id}/photo`,
    "https://www.zohoapis.eu",
  );

  const response = await fetch(url, {
    method: "get",
    headers: {
      authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Zoho CRM API photo request error: "${response.statusText}`,
    );
  }
  if (!response.body) {
    throw new Error(`Zoho CRM API contact photo not found for ID "${id}"`);
  }

  const file = Readable.fromWeb(response.body);
  const contentType = response.headers.get("content-type")?.split(";")?.[0];
  const fileName = parseContentDisposition(
    response.headers.get("content-disposition"),
  )?.parameters?.filename;

  return {
    file,
    contentType,
    fileName,
  };
};
