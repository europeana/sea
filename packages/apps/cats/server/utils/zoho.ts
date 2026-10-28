import { createZohoAPIClient } from "@/services/zoho/api";

let zohoClient;

export const useZoho = () => {
  if (!zohoClient) {
    zohoClient = createZohoAPIClient();
  }
  return zohoClient;
};
