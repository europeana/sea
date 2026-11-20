import type { Job } from "bullmq";
import { useContentfulClient } from "@/utils/contentful";
import { localeForLang } from "@/utils/i18n/locales";

export { name as queueName } from "@/queues/translate/store";

export const processor = async (job: Job) => {
  const contentfulClient = useContentfulClient();

  // all per-language receipt children jobs are complete; assemble their values
  // into the entry's field localisations
  const childrenValues = await job.getChildrenValues();

  let entry = await contentfulClient.entry.get({ entryId: job.data.entryId });

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
  entry = await contentfulClient.entry.update({ entryId: entry.sys.id }, entry);
  entry = await contentfulClient.entry.publish(
    { entryId: entry.sys.id },
    entry,
  );

  return entry;
};

export const opts = {};
