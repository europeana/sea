import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";

import { ZohoContact, ZohoContactRecord } from "@europeana/zoho-client";
import { ZohoContactEntry, ZohoContactEntryFields } from "@/types/contentful";
import { createOrUpdateEntry } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";

export { name as queueName } from "@/queues/zoho/crm/syncContact";

const CONTACT_SYNC_FIELDS = [
  "id",
  "Full_Name",
  "Public_email",
  "LinkedIn",
  "Communities",
  "Contact_Participation",
  "Country_new",
  "Title",
  "Europeana_Initiative_role_chair",
  "Europeana_Initiative_role_vice_chair",
  "Europeana_Initiative_role_treasurer",
  "Europeana_Initiative_role_member",
];

export const processor = async (
  job: Job,
): Promise<{ entryId: string | null }> => {
  const contentfulLocale = useRuntimeConfig().contentful?.defaultLocale;
  const contentfulContentTypeId = "zohoContact";

  const zohoContact = await findZohoContact(job);

  const fields = mapZohoContactToContentfulPersonEntryFields(
    zohoContact,
    contentfulLocale,
  );

  const photoAssetId = await getPhotoAssetId(job);
  if (photoAssetId) {
    addImageToZohoContactEntryFields(fields, photoAssetId);
  }

  const contentfulEntry: ZohoContactEntry | null = (await createOrUpdateEntry(
    {
      contentTypeId: contentfulContentTypeId,
      entryId: `zohoContact-${zohoContact.id}`,
    },
    {
      content_type: contentfulContentTypeId,
      "fields.identifier": zohoContact.id,
    },
    { fields },
    true,
  )) as ZohoContactEntry;

  if (contentfulEntry) {
    return { entryId: contentfulEntry.sys.id };
  } else {
    return { entryId: null };
  }
};

export const opts = {};

const mapZohoContactToContentfulPersonEntryFields = (
  zohoContact: ZohoContact,
  locale: string,
): ZohoContactEntryFields => {
  return {
    name: { [locale]: zohoContact.name },
    identifier: { [locale]: zohoContact.id },
    email: { [locale]: zohoContact.email },
    participation: { [locale]: zohoContact.participation },
    title: { [locale]: zohoContact.jobTitle },
    linkedInUrl: { [locale]: zohoContact.linkedIn },
    country: { [locale]: zohoContact.country },
    communities: { [locale]: zohoContact.communities },
    roleChair: { [locale]: zohoContact.roleChair },
    roleMember: { [locale]: zohoContact.roleMember },
    roleTreasurer: { [locale]: zohoContact.roleTreasurer },
    roleViceChair: { [locale]: zohoContact.roleViceChair },
  };
};

const findZohoContact = async (job: Job): Promise<ZohoContact> => {
  const contactId: string = job.data.contactId;
  const zohoContactRecord: ZohoContactRecord | null = job.data.contactRecord;
  let zohoContact: ZohoContact | null;

  if (zohoContactRecord) {
    zohoContact = new ZohoContact(zohoContactRecord);
  } else {
    zohoContact = await useZoho().crm.fetchZohoContact(
      contactId,
      CONTACT_SYNC_FIELDS.join(","),
    );
  }

  if (!zohoContact) {
    throw new Error(`No Zoho contact for ID "${contactId}`);
  }

  return zohoContact;
};

const getPhotoAssetId = async (job: Job): Promise<string | undefined> => {
  const childrenValues = await job.getChildrenValues();
  const photoJobKey: string | undefined = Object.keys(childrenValues).find(
    (key) => key.includes("zoho-crm-sync-photo-"),
  );
  return photoJobKey ? childrenValues[photoJobKey]?.assetId : undefined;
};

const addImageToZohoContactEntryFields = (
  fields: ZohoContactEntryFields,
  imageAssetId: string,
) => {
  const contentfulLocale = useRuntimeConfig().contentful?.defaultLocale;
  fields.image = {
    [contentfulLocale]: {
      sys: {
        type: "Link",
        linkType: "Asset",
        id: imageAssetId,
      },
    },
  };
};
