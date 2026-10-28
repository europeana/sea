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
