export type ZohoAPIErrorResponse = {
  code: string;
};

export type ZohoAuthConfig = {
  clientId: string;
  clientSecret: string;
  serviceOrgId: string;
  url?: string | URL;
};

export type ZohoBulkReadCriteria = {
  field: {
    api_name: string;
  };
  comparator:
    | "between"
    | "contains"
    | "ends_with"
    | "equal"
    | "greater_equal"
    | "greater_than"
    | "in"
    | "less_equal"
    | "less_than"
    | "not_between"
    | "not_contains"
    | "not_equal"
    | "not_in"
    | "starts_with";
  value: string | string[];
};

export type ZohoBulkReadRequestBody = {
  callback?: {
    url: string;
    method: "post";
  };
  query?: {
    module: {
      api_name: string;
    };
    fields?: string[];
    criteria?: ZohoBulkReadCriteria;
  };
  file_type?: "ics";
};

export type ZohoContactRecord = {
  id: string;
  Communities: string[];
  Contact_Participation: string[];
  Country_new: string;
  Full_Name: string;
  LinkedIn: string;
  Modified_Time: string;
  Public_email: string;
  Title: string;
  Europeana_Initiative_role_chair: string[];
  Europeana_Initiative_role_vice_chair: string[];
  Europeana_Initiative_role_treasurer: string[];
  Europeana_Initiative_role_member: string[];
};

export type ZohoOAuthTokenResponse = {
  access_token: string;
  scope: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
};
