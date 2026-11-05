import { ZohoAPIClient, createZohoAPIClient } from "./api.js";
import { createZohoAccessToken } from "./auth.js";
import { ZohoCRMClient, createZohoCRMClient } from "./crm.js";
import { ZohoContact } from "./models/crm/contact.js";

export {
  createZohoAccessToken,
  createZohoAPIClient,
  createZohoCRMClient,
  ZohoAPIClient,
  ZohoContact,
  ZohoCRMClient,
};

export type {
  ZohoAPIErrorResponse,
  ZohoAuthConfig,
  ZohoBulkReadCriteria,
  ZohoBulkReadRequestBody,
  ZohoContactRecord,
  ZohoOAuthTokenResponse,
} from "./types.js";
