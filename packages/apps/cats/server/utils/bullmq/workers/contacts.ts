import { Job, Worker } from "bullmq";
import { Entry as ContentfulEntry } from "contentful-management";
// TODO: use csv-parse instead
import * as csv from "csv";
import moment from "moment";
import * as unzip from "unzip-stream";

import { useFlowProducer, useQueueOptions } from "../queue";
import {
  createZohoBulkReadJob,
  fetchZohoBulkReadJobResult,
  fetchZohoContact,
  fetchZohoPhoto,
  ZohoBulkReadCriteria,
} from "../../zoho";
import { createSyncContactFlow } from "../../../routes/zoho/contacts/index.post";
import { useContentfulEnvironment } from "../../contentfulEnvironment";

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

// const syncParticipation = async (job: Job) => {
//   const participation: Array<string> = job.data.contactParticipation.filter((p) => CONTACT_PARTICIPATION_LEVELS.includes(p));

//   if (participation.length === 0) {
//     // TODO: any other action here?
//     return null;
//   }

//   const pageNumber = job.data.pageNumber || 1;
//   const pageToken = job.data.pageToken;

//   console.log("syncParticipation", participation, pageNumber, pageToken)

//   const page = await fetchZohoContacts({ pageToken });

//   const contacts = (page.data || [])
//     .filter((contact) => contact.Contact_Participation.some((p: string) => participation.includes(p)));
//   for (const contact of contacts) {
//     console.log(`Creating sync contact flow for ${contact.Full_Name} ${contact.Contact_Participation}`);
//     const flow = createSyncContactFlow({
//       contactId: contact.id,
//       modified: moment(contact.Modified_Time).unix(),
//       record: contact,
//     });
//     const flowProducer = useFlowProducer();
//     await flowProducer.add(flow);
//   }

//   const nextPageNumber = pageNumber + 1;
//   const nextPageToken = page.info["next_page_token"];
//   if (nextPageToken) {
//     console.log(`Creating job for next page`, nextPageNumber, nextPageToken)
//     const jobId = job.id?.replace(`-page${pageNumber}`, `-page${nextPageNumber}`);

//     await useQueue("contacts").add(
//       "sync-participation",
//       {
//         contactParticipation: participation,
//         pageNumber: nextPageNumber,
//         pageToken: nextPageToken,
//       },
//       {
//         jobId,
//         // TODO: review attempts & backoff
//         attempts: 1,
//         // backoff: {
//         //   type: "fixed",
//         //   delay: 60_000,
//         // },
//       },
//     );
//   }
// };

const syncPhoto = async (job: Job): Promise<{ assetId: string | null }> => {
  const contactId = job.data.contactId;
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
  let zohoContact = job.data.contactRecord;

  const childrenValues = await job.getChildrenValues();
  const photoJobKey: string | undefined = Object.keys(childrenValues).find(
    (key) => key.endsWith("-photo"),
  );
  const photoAssetId: string | undefined = childrenValues[photoJobKey]?.assetId;

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

  const roles = zohoContact.Contact_Participation.filter((cp) =>
    CONTACT_PARTICIPATION_LEVELS.includes(cp),
  );

  const fields = {
    email: { [LOCALE]: zohoContact.Public_email },
    name: { [LOCALE]: zohoContact.Full_Name },
    role: { [LOCALE]: roles },
    title: { [LOCALE]: zohoContact.Title },
    url: { [LOCALE]: zohoContact.LinkedIn },
    zohoId: { [LOCALE]: contactId },
  };
  if (photoAssetId) {
    fields.image = {
      [LOCALE]: {
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

const processBulkCreateJob = async (
  job: Job,
): Promise<{ zohoBulkReadJobId: string }> => {
  const criteria: ZohoBulkReadCriteria = job.data.criteria;

  const response = await createZohoBulkReadJob(criteria);

  const zohoBulkReadJobId = response.data[0].details.id;

  return {
    zohoBulkReadJobId,
  };
};

const processBulkResultJob = async (job: Job) => {
  const zohoBulkReadJobId: string = job.data.zohoBulkReadJobId;

  // response is a stream of a zipped csv file
  const response = await fetchZohoBulkReadJobResult(zohoBulkReadJobId);

  console.log("processBulkResultJob response", response);

  if (!response) {
    throw new Error("No Zoho Bulk Read Job result");
  }

  // const csvHandler = new WritableStream({
  //   write(chunk) {
  //     return new Promise((resolve, reject) => {
  //       console.log('csv chunk', chunk)
  //       resolve();
  //     });
  //   }
  // });

  response.pipe(unzip.Parse()).on("entry", function (entry) {
    console.log("zip file entry", entry);
    const filePath = entry.path;
    if (filePath === `${zohoBulkReadJobId}.csv`) {
      // entry.pipe(fs.createWriteStream('output/path'));
      // entry.autodrain();
      entry
        // TODO: the csv-parse callback API used here loads all
        //       rows into memory. use a stream instead, like
        //       entry.pipe(csv.parse()).pipe(csvHandler)
        .pipe(
          csv.parse(
            { columns: true },
            async function (err, rows: Array<object>) {
              console.log("csv records", rows);

              // TODO: validate contact matches participation level criteria?
              // queue a job to sync each contact, w/ record provided
              for (const contact of rows) {
                console.log(
                  `Creating sync contact flow for ${contact.Full_Name} ${contact.Contact_Participation}`,
                );
                const flow = createSyncContactFlow({
                  contactId: contact.id || contact.Id,
                  modified: moment(contact.Modified_Time).unix(),
                  record: contact,
                });
                const flowProducer = useFlowProducer();
                await flowProducer.add(flow);
              }
            },
          ),
        );
    } else {
      entry.autodrain();
    }
  });

  return {
    zohoBulkReadJobId,
  };
};

export const contactsQueueWorker = async (job: Job) => {
  console.log("worker(contacts)", job.name, job.id);

  const processors = {
    "sync-photo": syncPhoto,
    "sync-contact": syncContact,
    "bulk-create": processBulkCreateJob,
    "bulk-result": processBulkResultJob,
  };

  if (processors[job.name]) {
    return processors[job.name](job);
  }

  throw new Error(`No handler for contacts queue job "${job.name}"`);
};
