import { Job } from "bullmq";
import { useContentfulEnvironment } from "../../services/contentful";
import { supportedLocales } from "../../utils/i18n/locales";
import { useFlowProducer } from "../../utils/queues";
import { markupFields } from "../../utils/html/markupFields";
import { requestTranslation } from "../../services/eTranslation";

import { name as receiveQueueName } from "./receive";
import { name as storeQueueName } from "./store";

export { name, processor, opts };

const name = "translate-request";

const processor = async (job: Job) => {
  const contentfulEnvironment = await useContentfulEnvironment();
  const flowProducer = useFlowProducer();

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
    queueName: storeQueueName,
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
      queueName: receiveQueueName,
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

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
  //
  // limit to 10 jobs per minute to not overload eTranslation service
  limiter: {
    max: 10,
    duration: 60_000,
  },
};

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
