import { createZohoAPIClient, ZohoAPIClient } from "@/services/zoho/api";

let zohoClient: ZohoAPIClient;

export const useZoho = () => {
  if (!zohoClient) {
    zohoClient = createZohoAPIClient();
  }
  return zohoClient;
};
