import { beforeEach, describe, it, expect } from "vitest";

import { ZohoContact } from "@/models/zoho/crm/contact";
import { ZohoContactRecord } from "@/types/zoho";
import { PersonEntryFields } from "@/types/contentful";

describe("ZohoContact", () => {
  let record: ZohoContactRecord;
  let zohoContact: ZohoContact;

  beforeEach(() => {
    record = {
      id: "12345",
      Country_new: "USA",
      Full_Name: "John Doe",
      LinkedIn: "https://www.linkedin.com/in/johndoe",
      Modified_Time: "2023-10-01T00:00:00Z",
      Public_email: "john.doe@example.com",
      Title: "Software Engineer",
      Communities: ["Communicators", "Copyright"], // Use valid community values
      Contact_Participation: ["Staff", "Network Association"], // Use valid participation values
    };
    zohoContact = new ZohoContact(record);
  });

  it("should return the correct id", () => {
    expect(zohoContact.id).toBe("12345");
  });

  it("should return the correct country", () => {
    expect(zohoContact.country).toBe("USA");
  });

  it("should return the correct name", () => {
    expect(zohoContact.name).toBe("John Doe");
  });

  it("should return the correct LinkedIn URL", () => {
    expect(zohoContact.linkedIn).toBe("https://www.linkedin.com/in/johndoe");
  });

  it("should return the correct modified time", () => {
    expect(zohoContact.modifiedTime).toBe("2023-10-01T00:00:00Z");
  });

  it("should return the correct email", () => {
    expect(zohoContact.email).toBe("john.doe@example.com");
  });

  it("should return the correct job title", () => {
    expect(zohoContact.jobTitle).toBe("Software Engineer");
  });

  it("should return the correct communities", () => {
    expect(zohoContact.communities).toEqual(["Communicators", "Copyright"]);
  });

  it("should return the correct participation", () => {
    expect(zohoContact.participation).toEqual(["Staff", "Network Association"]);
  });

  it("should convert to ContentfulPersonEntryFields correctly", () => {
    const locale = "en-US";
    const expectedFields: PersonEntryFields = {
      name: { [locale]: "John Doe" },
      email: { [locale]: "john.doe@example.com" },
      participation: { [locale]: ["Staff", "Network Association"] },
      title: { [locale]: "Software Engineer" },
      country: { [locale]: "USA" },
      communities: { [locale]: ["Communicators", "Copyright"] },
      url: { [locale]: "https://www.linkedin.com/in/johndoe" },
      zohoId: { [locale]: "12345" },
    };

    expect(zohoContact.toContentfulPersonEntryFields(locale)).toEqual(
      expectedFields,
    );
  });
});
