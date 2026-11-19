import { beforeEach, describe, it, expect } from "vitest";

import { ZohoContact } from "../../../src/models/crm/contact.js";
import { ZohoContactRecord } from "../../../src/types.js";

describe("ZohoContact", () => {
  let record: ZohoContactRecord;
  let zohoContact: ZohoContact;

  beforeEach(() => {
    record = {
      id: "12345",
      Country_new: "Netherlands",
      Full_Name: "John Doe",
      LinkedIn: "https://linkedin.com",
      Modified_Time: "2023-10-01T00:00:00Z",
      Public_email: "john.doe@example.com",
      Title: "Software Engineer",
      Communities: ["Communicators", "Copyright"],
      Contact_Participation: ["Staff", "Network Association"],
      Europeana_Initiative_role_chair: ["Capacity Building Working Group"],
      Europeana_Initiative_role_vice_chair: [
        "Europeana Network Association Management Board",
      ],
      Europeana_Initiative_role_treasurer: ["Europeana Aggregators' Forum"],
      Europeana_Initiative_role_member: [
        "Article 14 Task Force",
        "Data Quality Committee Working Group",
      ],
    };
    zohoContact = new ZohoContact(record);
  });

  const propertyMappings: Array<[keyof ZohoContact, keyof ZohoContactRecord]> =
    [
      ["id", "id"],
      ["country", "Country_new"],
      ["name", "Full_Name"],
      ["linkedIn", "LinkedIn"],
      ["modifiedTime", "Modified_Time"],
      ["email", "Public_email"],
      ["jobTitle", "Title"],
      ["communities", "Communities"],
      ["participation", "Contact_Participation"],
      ["roleChair", "Europeana_Initiative_role_chair"],
      ["roleViceChair", "Europeana_Initiative_role_vice_chair"],
      ["roleTreasurer", "Europeana_Initiative_role_treasurer"],
      ["roleMember", "Europeana_Initiative_role_member"],
    ];

  it.each(propertyMappings)(
    "should map %s to record.%s",
    (contactProp, recordProp) => {
      expect(zohoContact[contactProp]).toEqual(record[recordProp]);
    },
  );
});
