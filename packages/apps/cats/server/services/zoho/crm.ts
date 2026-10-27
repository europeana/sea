import { useRuntimeConfig } from "nitropack/runtime";
import { parse as parseContentDisposition } from "content-disposition";
import { Readable } from "node:stream";

import { zohoFetch } from "./api";

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
  Communities: Array<string>;
  Contact_Participation: Array<string>;
  Country_new: string;
  Title: string;
  Public_email: string;
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
      // TODO: should this go into args? or be derived from ZohoContactRecord type?
      fields: [
        "id",
        "Full_Name",
        "Public_email",
        "LinkedIn",
        "Communities",
        "Contact_Participation",
        "Country_new",
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

  const response = await zohoFetch(url, {
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

  const response = await zohoFetch(url);

  if (!response.body) {
    return null;
  }

  return Readable.fromWeb(response.body);
};

export const fetchZohoContact = async (
  id: string,
): Promise<ZohoContactRecord | null> => {
  // TODO: should this go into args? or be derived from ZohoContactRecord type?
  const params = {
    fields:
      "id,Full_Name,Public_email,LinkedIn,Communities,Contact_Participation,Country_new,Title",
  };
  const response = await zohoFetch(`/crm/v8/Contacts/${id}`, { params });

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
  const response = await zohoFetch(`/crm/v8/Contacts/${id}/photo`);

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
