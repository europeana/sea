import type { Job } from "bullmq";
import { useContentfulEnvironment } from "@/services/contentful";
import { localeForLang } from "@/utils/i18n/locales";

export { name, processor, opts };

const name = "translate-store";

const processor = async (job: Job) => {
  const contentfulEnvironment = await useContentfulEnvironment();

  // all per-language receipt children jobs are complete; assemble their values
  // into the entry's field localisations
  const childrenValues = await job.getChildrenValues();

  let entry = await contentfulEnvironment.getEntry(job.data.entryId);

  entry.fields = Object.keys(entry.fields).reduce((memo, fieldId) => {
    // discard any field not having the source language (English), which
    // should not have been translated
    if (Object.keys(entry.fields[fieldId]).includes("en-GB")) {
      memo[fieldId] = entry.fields[fieldId];
    }
    return memo;
  }, {});

  for (const childValue of Object.values(childrenValues)) {
    const locale = localeForLang(childValue.lang);
    for (const fieldId in childValue.fields) {
      if (Object.keys(entry.fields).includes(fieldId)) {
        entry.fields[fieldId][locale] = childValue.fields[fieldId];
      }
    }
  }

  // write to Contentful
  entry = await entry.update();
  entry = await entry.publish();

  return entry;
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};
