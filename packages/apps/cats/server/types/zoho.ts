export type ZohoBulkReadCriteria = {
  field: {
    api_name: string;
  };
  comparator: string;
  value: Array<string> | string;
};

export type ZohoContactCommunity =
  | "Communicators"
  | "Copyright"
  | "Climate"
  | "Education"
  | "EuropeanaTech"
  | "Impact"
  | "Research";

export type ZohoContactParticipation =
  | "Staff"
  | "Network Association"
  | "Members Council"
  | "Management Board"
  | "Advisory Board"
  | "Supervisory Board"
  | "Aggregators Forum";

// TODO: add role field when decided how to model it in Zoho CRM
export type ZohoContactRecord = {
  id: string;
  Communities: Array<ZohoContactCommunity>;
  Contact_Participation: Array<ZohoContactParticipation>;
  Country_new: string;
  Full_Name: string;
  LinkedIn: string;
  Modified_Time: string;
  Public_email: string;
  Title: string;
};
