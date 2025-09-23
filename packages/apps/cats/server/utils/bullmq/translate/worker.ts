import { Job, WaitingChildrenError, Worker } from "bullmq";

let contentfulEnvironment;

export const useTranslateQueueWorker = () =>
  new Worker("translate", translateQueueWorker, {
    ...useQueueOptions(),
    // removeOnComplete: { count: 1000 },
    // removeOnFail: { count: 5000 },
  });

export const translateQueueWorker = async (job: Job, token?: string) => {
  console.log("worker(translate)", job.id);

  if (!contentfulEnvironment) {
    contentfulEnvironment = await useContentfulEnvironment();
  }

  if (!job.data.contentType) {
    const contentTypeId = job.data.entry.sys?.contentType?.sys?.id;
    const contentType =
      await contentfulEnvironment.getContentType(contentTypeId);
    await job.updateData({ ...job.data, contentType });
  }

  if (!job.data.html) {
    const html = markupFields(job.data);
    await job.updateData({ ...job.data, html });
  }

  if (!job.data.eTranslationRequestId) {
    for (const lang of targetLanguages) {
      const jobId = `${job.id}-${lang}`;

      // queue jobs for receiving per-language translations
      await addJobToReceiveQueue({
        contentType: job.data.contentType,
        jobId,
        lang,
        parentId: job.id,
        parentQueue: job.queueQualifiedName,
      });
    }

    const { requestId } = await requestTranslation({
      externalReference: job.id,
      html: job.data.html,
    });
    await job.updateData({ ...job.data, eTranslationRequestId: requestId });
  }

  const shouldWait = await job.moveToWaitingChildren(token);
  if (shouldWait) {
    throw new WaitingChildrenError();
  }

  // all per-language receipt children jobs are complete; assemble their values
  // into the entry's field localisations
  const childrenValues = await job.getChildrenValues();

  let entry = await contentfulEnvironment.getEntry(job.data.entry.sys.id);

  for (const childValue of Object.values(childrenValues)) {
    for (const fieldId in childValue.fields) {
      entry.fields[fieldId][localeForLang(childValue.lang)] =
        childValue.fields[fieldId];
    }
  }

  // write to Contentful
  entry = await entry.update();
  entry = await entry.publish();

  return entry;
};
