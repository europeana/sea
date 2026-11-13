import { Readable } from "node:stream";
import { Job, FlowJob } from "bullmq";
import { parse } from "csv-parse";
import * as unzip from "unzip-stream";
import { ZohoContactRecord } from "@europeana/zoho-client";

import { useFlowProducer } from "@/utils/queues";
import { useZoho } from "@/utils/zoho";
import { createSyncContactFlow } from "@/flows/zoho";

export { name, processor, opts };

const name = "zoho-crm-process-bulk-read";

const processor = async (
  job: Job,
): Promise<{ zohoBulkReadJobId: string; queuedCount: number }> => {
  const zohoBulkReadJobId: string = job.data.zohoBulkReadJobId;

  // response is a stream of a zipped csv file
  const response: Readable | null =
    await useZoho().crm.fetchZohoBulkReadJobResult(zohoBulkReadJobId);

  if (!response) {
    throw new Error("No Zoho Bulk Read Job result");
  }

  const flowProducer = useFlowProducer();
  const targetFileName = `${zohoBulkReadJobId}.csv`;
  let queuedCount = 0;

  await new Promise<void>((resolve, reject) => {
    const entryTasks: Promise<void>[] = [];
    const unzipStream = unzip.Parse();

    const handleError = (err: unknown) => {
      response.destroy();
      unzipStream.destroy();
      reject(err);
    };

    response.on("error", handleError);
    unzipStream.on("error", handleError);

    unzipStream.on("entry", (entry) => {
      if (entry.path === targetFileName) {
        const task = processCsvEntry(entry, flowProducer)
          .then((count) => {
            queuedCount += count;
          })
          .catch(handleError);
        entryTasks.push(task);
      } else {
        entry.autodrain();
      }
    });

    unzipStream.on("close", async () => {
      try {
        await Promise.all(entryTasks);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    response.pipe(unzipStream);
  });

  return {
    zohoBulkReadJobId,
    queuedCount,
  };
};

const processCsvEntry = async (
  entry: Readable,
  flowProducer: ReturnType<typeof useFlowProducer>,
  batchSize = 100,
): Promise<number> => {
  const parser = entry.pipe(parse({ columns: true }));
  let batch: FlowJob[] = [];
  let totalQueued = 0;

  for await (const rawRecord of parser) {
    const contact = rawRecord as ZohoContactCSVRecord;

    const flow = createSyncContactFlow({
      contactId: contact.Id,
      modified: Date.parse(contact.Modified_Time),
      record: {
        ...contact,
        id: contact.Id,
        Communities: listValueAsArray(contact.Communities),
        Contact_Participation: listValueAsArray(contact.Contact_Participation),
      } as ZohoContactRecord,
    });

    batch.push(flow);

    if (batch.length >= batchSize) {
      await flowProducer.addBulk(batch);
      totalQueued += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await flowProducer.addBulk(batch);
    totalQueued += batch.length;
  }

  return totalQueued;
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
    return value.split(splitter).filter(Boolean);
  }
  return value;
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
