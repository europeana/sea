import { ZohoContactRecord } from "@/types/zoho";
import { PersonEntryFields } from "@/types/contentful";

export class ZohoContact {
  private record: ZohoContactRecord;

  constructor(record: ZohoContactRecord) {
    this.record = record;
  }

  get id(): string {
    return this.record.id;
  }

  get country(): string {
    return this.record.Country_new;
  }

  get name(): string {
    return this.record.Full_Name;
  }

  get linkedIn(): string {
    return this.record.LinkedIn;
  }

  get modifiedTime(): string {
    return this.record.Modified_Time;
  }

  get email(): string {
    return this.record.Public_email;
  }

  get jobTitle(): string {
    return this.record.Title;
  }

  get communities(): string[] {
    return listValueAsArray(this.record.Communities);
  }

  get participation(): string[] {
    return listValueAsArray(this.record.Contact_Participation);
  }

  toContentfulPersonEntryFields(locale: string): PersonEntryFields {
    return {
      name: { [locale]: this.name },
      email: { [locale]: this.email },
      participation: { [locale]: this.participation },
      title: { [locale]: this.jobTitle },
      country: { [locale]: this.country },
      communities: { [locale]: this.communities },
      url: { [locale]: this.linkedIn },
      zohoId: { [locale]: this.id },
    };
  }
}

const listValueAsArray = (
  value: string | Array<string>,
  splitter: string = ";",
): Array<string> => {
  if (typeof value === "string") {
    // e.g. from csv export
    return value.split(splitter).filter(Boolean);
  } else {
    return value;
  }
};
