import { Job } from "bullmq";
// TODO: use csv-parse instead
import * as csv from "csv";
import * as unzip from "unzip-stream";
import { ZohoContactRecord } from "@europeana/zoho-client";

import { useFlowProducer } from "@/utils/queues";
import { useZoho } from "@/utils/zoho";
// TODO: mv elsewhere
import { createSyncContactFlow } from "@/routes/zoho/contacts/index.post";

export { name, processor, opts };

const name = "zoho-crm-process-bulk-read";

const processor = async (job: Job) => {
  const zohoBulkReadJobId: string = job.data.zohoBulkReadJobId;

  // response is a stream of a zipped csv file
  const response =
    await useZoho().crm.fetchZohoBulkReadJobResult(zohoBulkReadJobId);

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
    const filePath = entry.path;
    if (filePath === `${zohoBulkReadJobId}.csv`) {
      entry
        // TODO: the csv-parse callback API used here loads all
        //       rows into memory. use a stream instead, like
        //       entry.pipe(csv.parse()).pipe(csvHandler)
        .pipe(
          csv.parse(
            { columns: true },
            async function (err, rows: ZohoContactCSVRecord[]) {
              // queue a job to sync each contact, w/ record provided
              // TODO: validate contact matches participation level criteria?
              for (const contact of rows) {
                const flow = createSyncContactFlow({
                  contactId: contact.Id,
                  modified: Date.parse(contact.Modified_Time),
                  record: {
                    ...contact,
                    id: contact.Id,
                    Communities: listValueAsArray(contact.Communities),
                    Contact_Participation: listValueAsArray(
                      contact.Contact_Participation,
                    ),
                  } as ZohoContactRecord,
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

const opts = {
  removeOnComplete: { count: 0 },
  // removeOnFail: { count: 5000 },
};

const listValueAsArray = (
  value: string | Array<string>,
  splitter: string = ";",
): Array<string> => {
  if (typeof value === "string") {
    // e.g. from csv export
    return value.split(splitter).filter(Boolean);
  } else {
    return value;
  }
};

type ZohoContactCSVRecord = {
  Id: string;
  Communities: string;
  Contact_Participation: string;
  Country_new: string;
  Full_Name: string;
  LinkedIn: string;
  Modified_Time: string;
  Public_email: string;
  Title: string;
};
