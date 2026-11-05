import { ZohoContactRecord } from "../../types.js";

export class ZohoContact {
  private readonly record: ZohoContactRecord;

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
    return this.record.Communities;
  }

  get participation(): string[] {
    return this.record.Contact_Participation;
  }
}
