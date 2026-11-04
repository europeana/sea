export type ZohoBulkReadCriteria = {
  field: {
    api_name: string;
  };
  comparator: string;
  value: Array<string> | string;
};

// export const ZohoContactCommunityValues = [
//   "Climate",
//   "Communicators",
//   "Copyright",
//   "Education",
//   "EuropeanaTech",
//   "Impact",
//   "Research",
// ];
// export type ZohoContactCommunity = typeof ZohoContactCommunityValues[number];

// export const ZohoContactParticipationValues = [
//   "Advisory Board",
//   "Aggregators Forum",
//   "Management Board",
//   "Members Council",
//   "Network Association",
//   "Staff",
//   "Supervisory Board",
// ];
// export type ZohoContactParticipation = typeof ZohoContactParticipationValues[number];

// TODO: add role field when decided how to model it in Zoho CRM
export type ZohoContactRecord = {
  id: string;
  Communities: Array<string>;
  Contact_Participation: Array<string>;
  Country_new: string;
  Full_Name: string;
  LinkedIn: string;
  Modified_Time: string;
  Public_email: string;
  Title: string;
};
