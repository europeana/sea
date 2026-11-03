import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";

import { PersonEntry, PersonEntryFields } from "@/types/contentful";
import { ZohoContact } from "@/models/zoho/crm/contact";
import { ZohoContactRecord } from "@/types/zoho";
import { createOrUpdateEntry } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";

export { name, processor, opts };

const name = "zoho-crm-sync-contact";

const processor = async (job: Job): Promise<{ entryId: string | null }> => {
  const zohoContact = await findZohoContact(job);
  const locale = useRuntimeConfig().contentful?.defaultLocale;

  const fields = zohoContact.toContentfulPersonEntryFields(locale);

  const photoAssetId = await getPhotoAssetId(job);
  if (photoAssetId) {
    addImageToPersonEntryFields(fields, photoAssetId);
  }

  const contentType = "person";

  const contentfulPersonEntry: PersonEntry | null = (await createOrUpdateEntry(
    contentType,
    {
      content_type: contentType,
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
  const locale = useRuntimeConfig().contentful?.defaultLocale;
  fields.image = {
    [locale]: {
      sys: {
        type: "Link",
        linkType: "Asset",
        id: imageAssetId,
      },
    },
  };
};
