import { Asset, Entry } from "contentful-management";

export type ZohoContactEntryFields = {
  name: { [locale: string]: string };
  identifier?: { [locale: string]: string };
  image?: { [locale: string]: Asset };
  email?: { [locale: string]: string };
  title?: { [locale: string]: string };
  linkedInUrl?: { [locale: string]: string };
  country?: { [locale: string]: string };
  communities?: { [locale: string]: string[] };
  participation?: { [locale: string]: string[] };
  roleChair?: { [locale: string]: string[] };
  roleMember?: { [locale: string]: string[] };
  roleTreasurer?: { [locale: string]: string[] };
  roleViceChair?: { [locale: string]: string[] };
};

export interface ZohoContactEntry extends Entry {
  fields: ZohoContactEntryFields;
}
