import { Asset, Entry } from "contentful-management";

export type PersonEntryFields = {
  name: { [locale: string]: string };
  affiliation?: { [locale: string]: string };
  url?: { [locale: string]: string };
  image?: { [locale: string]: Asset };
  email?: { [locale: string]: string };
  title?: { [locale: string]: string };
  country?: { [locale: string]: string };
  communities?: { [locale: string]: string[] };
  participation?: { [locale: string]: string[] };
  roleChair?: { [locale: string]: string[] };
  roleMember?: { [locale: string]: string[] };
  roleTreasurer?: { [locale: string]: string[] };
  roleViceChair?: { [locale: string]: string[] };
  zohoId?: { [locale: string]: string };
};

export interface PersonEntry extends Entry {
  fields: PersonEntryFields;
}
