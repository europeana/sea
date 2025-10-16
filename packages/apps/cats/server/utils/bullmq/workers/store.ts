import { Job, Worker } from "bullmq";

let contentfulEnvironment;

export const useStoreQueueWorker = () =>
  new Worker("store", storeQueueWorker, {
    ...useQueueOptions(),
    removeOnComplete: { count: 100 },
    // removeOnFail: { count: 5000 },
  });

export const storeQueueWorker = async (job: Job) => {
  console.log("worker(store)", job.id);

  if (!contentfulEnvironment) {
    contentfulEnvironment = await useContentfulEnvironment();
  }

  // all per-language receipt children jobs are complete; assemble their values
  // into the entry's field localisations
  const childrenValues = await job.getChildrenValues();

  let entry = await contentfulEnvironment.getEntry(job.data.entryId);

  for (const childValue of Object.values(childrenValues)) {
    for (const fieldId in childValue.fields) {
      if (!Object.keys(entry.fields).includes(fieldId)) {
        entry.fields[fieldId] = {};
      }
      entry.fields[fieldId][localeForLang(childValue.lang)] =
        childValue.fields[fieldId];
    }
  }

  // write to Contentful
  entry = await entry.update();
  entry = await entry.publish();

  return entry;
};
