import { Job } from "bullmq";
// TODO: use csv-parse instead
import * as csv from "csv";
import moment from "moment";
import * as unzip from "unzip-stream";

import { useFlowProducer } from "../../../utils/queues";
import { fetchZohoBulkReadJobResult } from "../../../services/zoho";
// TODO: mv elsewhere
import { createSyncContactFlow } from "../../../routes/zoho/contacts/index.post";

export { name, processor, opts };

const name = "zoho-crm-process-bulk-read";

const processor = async (job: Job) => {
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
              // console.log("csv records", rows);

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

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};
