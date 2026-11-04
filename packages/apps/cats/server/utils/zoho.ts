import { createZohoAPIClient, ZohoAPIClient } from "@europeana/zoho-client";

let zohoClient: ZohoAPIClient;

export const useZoho = () => {
  if (!zohoClient) {
    zohoClient = createZohoAPIClient();
  }
  return zohoClient;
};
