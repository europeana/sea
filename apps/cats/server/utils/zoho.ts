import { useRuntimeConfig } from "nitropack/runtime";
import { createZohoAPIClient, ZohoAPIClient } from "@europeana/zoho-client";

let zohoClient: ZohoAPIClient;

export const useZoho = () => {
  if (!zohoClient) {
    const config = useRuntimeConfig()?.zoho;
    zohoClient = createZohoAPIClient(config);
  }
  return zohoClient;
};
