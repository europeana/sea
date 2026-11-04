import { Asset, Entry } from "contentful-management";

export type PersonEntryFields = {
  name: { [locale: string]: string };
  affiliation?: { [locale: string]: string };
  url?: { [locale: string]: string };
  image?: { [locale: string]: Asset };
  email?: { [locale: string]: string };
  title?: { [locale: string]: string };
  country?: { [locale: string]: string };
  communities?: { [locale: string]: Array<string> };
  participation?: { [locale: string]: Array<string> };
  role?: { [locale: string]: string };
  zohoId?: { [locale: string]: string };
};

export interface PersonEntry extends Entry {
  fields: PersonEntryFields;
}
