import { Job, FlowProducer, Worker } from "bullmq";

let contentfulEnvironment;
let flowProducer;

export const useRequestQueueWorker = () =>
  new Worker("request", requestQueueWorker, {
    ...useQueueOptions(),
    removeOnComplete: { count: 100 },
    // removeOnFail: { count: 5000 },
    //
    // limit to 10 jobs per minute to not overload eTranslation service
    limiter: {
      max: 10,
      duration: 60_000,
    },
  });

const targetLanguagesFromTags = (tags = []) => {
  let locales;
  if (tags.find((tag) => tag.sys.id === "translate")) {
    locales = supportedLocales;
  } else {
    locales = tags
      .filter((tag) => tag.sys.id.startsWith("translate."))
      .map((tag) => tag.sys.id.split(".").pop());
  }

  return locales
    .filter((locale) => supportedLocales.includes(locale))
    .map((locale) => locale.split("-").shift().toUpperCase());
};

export const requestQueueWorker = async (job: Job) => {
  console.log("worker(request)", job.id);

  if (!contentfulEnvironment) {
    contentfulEnvironment = await useContentfulEnvironment();
  }

  if (!flowProducer) {
    flowProducer = new FlowProducer(useQueueOptions());
  }

  const targetLanguages = targetLanguagesFromTags(
    job.data.entry.metadata?.tags,
  );

  if (targetLanguages.length === 0) {
    // nothing to translate to; goodbye!
    return;
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

  await flowProducer.add({
    queueName: "store",
    name: "translation",
    data: { entryId: job.data.entry.sys.id },
    opts: {
      jobId: job.id,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 10_000,
      },
    },
    children: targetLanguages.map((lang) => ({
      queueName: "receive",
      name: "translation",
      data: {
        contentType: job.data.contentType,
        lang,
      },
      opts: {
        jobId: `${job.id}-${lang}`,
        attempts: 5,
        backoff: {
          type: "fixed",
          delay: 10_000,
        },
        delay: 86_400_000, // one day delay, removed by etr webhook once data is in
      },
    })),
  });

  if (!job.data.eTranslationRequestId) {
    const { requestId } = await requestTranslation({
      externalReference: job.id,
      html: job.data.html,
      targetLanguages,
    });
    await job.updateData({ ...job.data, eTranslationRequestId: requestId });
  }

  return targetLanguages;
};
