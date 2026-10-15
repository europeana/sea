import { Job, Worker } from "bullmq";
import { useQueueOptions } from "../queue";
import { fetchZohoContact, fetchZohoPhoto } from "../../zoho";
import { useContentfulEnvironment } from "../../contentfulEnvironment";
import { Entry as ContentfulEntry } from "contentful-management";

// TODO: mv to runtime config?
const CONTACT_PARTICIPATION_LEVELS = [
  "Advisory Board",
  "Aggregator Forum",
  "Management Board",
  "Members Council",
  "Network Association",
  "Staff",
  "Supervisory Board",
];
const LOCALE = "en-GB";

export const useContactsQueueWorker = () =>
  new Worker("contacts", contactsQueueWorker, {
    ...useQueueOptions(),
    removeOnComplete: { count: 100 },
    // removeOnFail: { count: 5000 },
  });

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

const syncPhoto = async ({
  contactId,
}: {
  contactId: string;
}): Promise<{ assetId: string | null }> => {
  const zohoPhoto = await fetchZohoPhoto(contactId);

  if (!zohoPhoto) {
    return { assetId: null };
  }

  const contentfulEnvironment = await useContentfulEnvironment();

  const contentfulAssetId = `zoho-contact-photo-${contactId}`;
  let contentfulAsset;

  const contentfulUpload = await contentfulEnvironment.createUpload({
    file: zohoPhoto.file,
  });

  const fields = {
    title: {
      [LOCALE]: `Zoho CRM Contact photo: ${contactId}`,
    },
    description: {
      [LOCALE]: "",
    },
    file: {
      [LOCALE]: {
        contentType: zohoPhoto.contentType,
        fileName: zohoPhoto.fileName,
        uploadFrom: {
          sys: {
            type: "Link",
            linkType: "Upload",
            id: contentfulUpload.sys.id,
          },
        },
      },
    },
  };

  try {
    contentfulAsset = await contentfulEnvironment.getAsset(contentfulAssetId);
  } catch (e) {
    if (e.name === "NotFound") {
      // asset not found, that's ok, we will create one
    } else {
      throw e;
    }
  }

  if (contentfulAsset) {
    contentfulAsset.fields = fields;
    await contentfulAsset.update();
  } else {
    contentfulAsset = await contentfulEnvironment.createAssetWithId(
      contentfulAssetId,
      {
        fields,
      },
    );
  }

  contentfulAsset = await contentfulAsset.processForAllLocales();
  await contentfulAsset.publish();

  return { assetId: contentfulAsset.sys.id };
};

const syncContact = async (job: Job): Promise<{ entryId: string | null }> => {
  const contactId: string = job.data.contactId;
  const childrenValues = await job.getChildrenValues();
  const photoJobKey: string | undefined = Object.keys(childrenValues).find(
    (key) => key.endsWith("-photo"),
  );
  const photoAssetId: string | undefined = childrenValues[photoJobKey]?.assetId;

  // TODO: make optional, if contact record is supplied in args
  const zohoContact = await fetchZohoContact(contactId);
  let contentfulPerson = await findContentfulEntry(contactId);

  const roles = zohoContact.Contact_Participation.filter((cp) =>
    CONTACT_PARTICIPATION_LEVELS.includes(cp),
  );

  const fields = {
    email: { [LOCALE]: zohoContact.Public_email },
    image: {
      [LOCALE]: {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: photoAssetId,
        },
      },
    },
    name: { [LOCALE]: zohoContact.Full_Name },
    role: { [LOCALE]: roles },
    title: { [LOCALE]: zohoContact.Title },
    zohoId: { [LOCALE]: contactId },
  };

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

export const contactsQueueWorker = async (job: Job) => {
  console.log("worker(contacts)", job.id);

  if (job.name === "sync-photo") {
    return await syncPhoto(job.data);
  } else if (job.name === "sync-contact") {
    return await syncContact(job);
  } else {
    throw new Error(`No handler for contacts queue job "${job.name}"`);
  }
};
