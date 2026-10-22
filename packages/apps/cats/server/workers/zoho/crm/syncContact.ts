import { Job } from "bullmq";
import { Entry as ContentfulEntry } from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

import { fetchZohoContact } from "../../../services/zoho";
import { useContentfulEnvironment } from "../../../services/contentful";

export { name, processor, opts };

const name = "zoho-crm-sync-contact";

const processor = async (job: Job): Promise<{ entryId: string | null }> => {
  const contactId: string = job.data.contactId;
  let zohoContact = job.data.contactRecord;

  const childrenValues = await job.getChildrenValues();
  const photoJobKey: string | undefined = Object.keys(childrenValues).find(
    (key) => key.endsWith("-photo"),
  );
  const photoAssetId: string | undefined = photoJobKey
    ? childrenValues[photoJobKey]?.assetId
    : undefined;

  if (!zohoContact) {
    console.log("fetching zohoContact");
    zohoContact = await fetchZohoContact(contactId);
    if (!zohoContact) {
      throw new Error(`No Zoho contact for ID "${contactId}`);
    }
  } else {
    console.log("zohoContact supplied in job data");
  }

  if (typeof zohoContact.Contact_Participation === "string") {
    // e.g. from csv export
    zohoContact.Contact_Participation =
      zohoContact.Contact_Participation.split(";");
  }

  let contentfulPerson = await findContentfulEntry(contactId);

  const roles = zohoContact.Contact_Participation.filter((cp: string) =>
    CONTACT_PARTICIPATION_LEVELS.includes(cp),
  );

  const locale = useRuntimeConfig().contentful.defaultLocale;

  const fields = {
    email: { [locale]: zohoContact.Public_email },
    image: undefined,
    name: { [locale]: zohoContact.Full_Name },
    role: { [locale]: roles },
    title: { [locale]: zohoContact.Title },
    url: { [locale]: zohoContact.LinkedIn },
    zohoId: { [locale]: contactId },
  };
  if (photoAssetId) {
    fields.image = {
      [locale]: {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: photoAssetId,
        },
      },
    };
  }

  if (contentfulPerson) {
    contentfulPerson.fields = {
      ...contentfulPerson.fields,
      ...fields,
    };
    contentfulPerson = await contentfulPerson.update();
  } else if (roles.length > 0) {
    const contentfulEnvironment = await useContentfulEnvironment();
    contentfulPerson = await contentfulEnvironment.createEntry("person", {
      fields,
    });
  }

  if (contentfulPerson) {
    await contentfulPerson.publish();
    return { entryId: contentfulPerson.sys.id };
  } else {
    return { entryId: null };
  }
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};

// TODO: mv to runtime config?
const CONTACT_PARTICIPATION_LEVELS = [
  "Advisory Board",
  "Aggregators Forum",
  "Management Board",
  "Members Council",
  "Network Association",
  "Staff",
  "Supervisory Board",
];

const findContentfulEntry = async (
  zohoId: string,
): Promise<ContentfulEntry | null> => {
  const contentfulEnvironment = await useContentfulEnvironment();
  const response = await contentfulEnvironment.getEntries({
    content_type: "person",
    "fields.zohoId": zohoId,
  });

  // TODO: handle more than 1? i.e. update all?
  if (response.total === 1) {
    return response.items[0];
  }

  return null;
};
