import { Job, WaitingChildrenError, Worker } from "bullmq";

let contentfulEnvironment;

export const useTranslateQueueWorker = () =>
  new Worker("translate", translateQueueWorker, {
    ...useQueueOptions(),
    // removeOnComplete: { count: 1000 },
    // removeOnFail: { count: 5000 },
  });

const targetLanguagesFromTags = (tags = []) => {
  return tags
    .filter((tag) => tag.sys.id.startsWith("translate."))
    .map((tag) => tag.sys.id.split(".").pop())
    .filter((locale) => supportedLocales.includes(locale))
    .map((locale) => locale.split("-").shift().toUpperCase());
};

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
    const targetLanguages = targetLanguagesFromTags(
      job.data.entry.metadata?.tags,
    );

    if (targetLanguages.length === 0) {
      // nothing to translate to; goodbye!
    }

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
      targetLanguages,
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
