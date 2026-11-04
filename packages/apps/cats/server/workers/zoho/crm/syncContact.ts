import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";

import { PersonEntry, PersonEntryFields } from "@/types/contentful";
import { ZohoContact, ZohoContactRecord } from "@europeana/zoho-client";
import { createOrUpdateEntry } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";

export { name, processor, opts };

const name = "zoho-crm-sync-contact";

const processor = async (job: Job): Promise<{ entryId: string | null }> => {
  const contentfulLocale = useRuntimeConfig().contentful?.defaultLocale;
  const contentfulContentTypeId = "person";

  const zohoContact = await findZohoContact(job);

  const fields = mapZohoContactToContentfulPersonEntryFields(
    zohoContact,
    contentfulLocale,
  );

  const photoAssetId = await getPhotoAssetId(job);
  if (photoAssetId) {
    addImageToPersonEntryFields(fields, photoAssetId);
  }

  const contentfulPersonEntry: PersonEntry | null = (await createOrUpdateEntry(
    contentfulContentTypeId,
    {
      content_type: contentfulContentTypeId,
      "fields.zohoId": zohoContact.id,
    },
    fields,
    true,
  )) as PersonEntry;

  if (contentfulPersonEntry) {
    return { entryId: contentfulPersonEntry.sys.id };
  } else {
    return { entryId: null };
  }
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};

const mapZohoContactToContentfulPersonEntryFields = (
  zohoContact: ZohoContact,
  locale: string,
): PersonEntryFields => {
  return {
    name: { [locale]: zohoContact.name },
    email: { [locale]: zohoContact.email },
    participation: { [locale]: zohoContact.participation },
    title: { [locale]: zohoContact.jobTitle },
    country: { [locale]: zohoContact.country },
    communities: { [locale]: zohoContact.communities },
    url: { [locale]: zohoContact.linkedIn },
    zohoId: { [locale]: zohoContact.id },
  };
};

const findZohoContact = async (job: Job): Promise<ZohoContact> => {
  const contactId: string = job.data.contactId;
  const zohoContactRecord: ZohoContactRecord | null = job.data.contactRecord;
  let zohoContact: ZohoContact | null;

  if (zohoContactRecord) {
    zohoContact = new ZohoContact(zohoContactRecord);
  } else {
    zohoContact = await useZoho().crm.fetchZohoContact(contactId);
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

const addImageToPersonEntryFields = (
  fields: PersonEntryFields,
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
