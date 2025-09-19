// TODO: move workers code to utils dir
// TODO: tagging, both for explicit translation opt-in, and indicating trans status
//       (or taxonomy)

import { Job, Worker, WaitingChildrenError } from "bullmq";
import contentfulManagement from "contentful-management";
import * as cheerio from "cheerio";
import { marked } from "marked";
import fetch from "node-fetch-native";
import TurndownService from "turndown";

let contentfulEnvironment;
let redisConnection;
let runtimeConfig;
const turndownService = new TurndownService();

const targetLanguages = [
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "ES",
  "ET",
  "FI",
  "FR",
  "GA",
  "HR",
  "HU",
  "IT",
  "LT",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SL",
  "SV",
];

const entryHtml = ({ entry, contentType }) => {
  const translatableFields = contentType.fields.filter(
    (field) => field.localized && ["Symbol", "Text"].includes(field.type),
  );

  const doc = cheerio.load("");
  const article = doc("<article></article>");

  for (const field of translatableFields) {
    const fieldValue = entry.fields[field.id]["en-GB"];

    const section = doc("<section></section>");
    section.attr("data-ctf-field-id", field.id);

    if (field.type === "Text") {
      // assume markdown, and convert to html
      section.html(marked.parse(fieldValue));
    } else {
      section.text(fieldValue);
    }

    article.append(section);
  }

  doc("body").append(article);

  return doc.html();
};

const receiveQueueWorker = async (job: Job) => {
  console.log("worker(receive)", job.id);

  if (job.data.html) {
    return job.data;
  } else {
    // or delay instead of fail?
    throw new Error("Translation not yet received");
  }
};

// bullmq worker for the "translate" queue
//
const translateQueueWorker = async (job: Job, token?: string) => {
  console.log("worker(translate)", job.id);

  if (!job.data.contentType) {
    const contentTypeId = job.data.entry.sys?.contentType?.sys?.id;
    const contentType =
      await contentfulEnvironment.getContentType(contentTypeId);
    await job.updateData({ ...job.data, contentType });
  }

  if (!job.data.html) {
    const html = entryHtml(job.data);
    await job.updateData({ ...job.data, html });
  }

  if (!job.data.eTranslationRequestId) {
    const receiveQueue = useQueues(runtimeConfig).receive;
    for (const lang of targetLanguages) {
      const jobId = `${job.id}-${lang}`;

      // TODO: set an initial delay before attempting
      await receiveQueue.add(
        "translation",
        { lang },
        {
          jobId,
          attempts: 5,
          backoff: {
            type: "fixed",
            delay: 10_000,
          },
          delay: 86_400_000, // one day delay, removed by etr webhook once data is in
          parent: {
            id: job.id,
            queue: job.queueQualifiedName,
          },
        },
      );
    }

    const { eTranslationRequestId } = await requestTranslation(job);
    await job.updateData({ ...job.data, eTranslationRequestId });
  }

  const shouldWait = await job.moveToWaitingChildren(token);
  if (shouldWait) {
    throw new WaitingChildrenError();
  }

  const childrenValues = await job.getChildrenValues();

  let entry = await contentfulEnvironment.getEntry(job.data.entry.sys.id);

  for (const childValue of Object.values(childrenValues)) {
    updateEntryFromHtml({
      ...childValue,
      contentType: job.data.contentType,
      entry,
    });
  }

  entry = await entry.update();
  entry = await entry.publish();

  return entry;
};

const requestTranslation = async (job) => {
  const requestBody = {
    callerInformation: {
      externalReference: job.id,
    },
    documentToTranslate: {
      document: {
        format: "html",
        content: Buffer.from(job.data.html).toString("base64"),
      },
    },
    sourceLanguage: "EN",
    targetLanguages,
    notifications: {
      success: {
        // TODO: make configurable
        http: "https://webhookit.io/4591f470-6d2d-415d-982d-f7986c809c7e",
      },
      failure: {
        // TODO: make configurable
        http: "https://webhookit.io/4591f470-6d2d-415d-982d-f7986c809c7e",
      },
    },
    deliveries: {
      // TODO: make configurable
      http: "https://contentful-translator.test.eanadev.org/hooks/etr",
      // http: "https://webhookit.io/4591f470-6d2d-415d-982d-f7986c809c7e"
    },
  };

  const basicAuth = Buffer.from(
    `${runtimeConfig.eTranslation.username}:${runtimeConfig.eTranslation.password}`,
  ).toString("base64");

  const response = await fetch(
    "https://language-tools.ec.europa.eu/etranslation/api/askTranslate",
    {
      method: "post",
      body: JSON.stringify(requestBody),
      headers: {
        authorization: `Basic ${basicAuth}`,
        "content-type": "application/json",
      },
    },
  );

  const responseBody = await response.json();

  return responseBody;
};

const updateEntryFromHtml = ({ contentType, entry, html, lang }) => {
  const locale = {
    BG: "bg-BG",
    CS: "cs-CZ",
    DA: "da-DK",
    DE: "de-DE",
    EL: "el-GR",
    ES: "es-ES",
    ET: "et-EE",
    FI: "fi-FI",
    FR: "fr-FR",
    GA: "ga-IE",
    HR: "hr-HR",
    HU: "hu-HU",
    IT: "it-IT",
    LT: "lt-LT",
    LV: "lv-LV",
    MT: "mt-MT",
    NL: "nl-NL",
    PL: "pl-PL",
    PT: "pt-PT",
    RO: "ro-RO",
    SK: "sk-SK",
    SL: "sl-SI",
    SV: "sv-SE",
  }[lang];

  const doc = cheerio.load(html);
  const article = doc("article").first();

  for (const element of article.children("section")) {
    const section = doc(element);
    const fieldId = section.attr("data-ctf-field-id");
    const field = contentType.fields.find((field) => field.id === fieldId);

    let fieldMaxLength = null;
    if (field.type === "Symbol") {
      fieldMaxLength = 255;
    }
    const fieldSizeValidation = field.validations.find((val) => val.size);
    if (fieldSizeValidation?.size?.max) {
      fieldMaxLength = fieldSizeValidation?.size?.max;
    }

    if (field.type === "Text") {
      entry.fields[fieldId][locale] = turndownService.turndown(section.html());
    } else {
      entry.fields[fieldId][locale] = section.text();
    }

    if (
      fieldMaxLength &&
      entry.fields[fieldId][locale].length > fieldMaxLength
    ) {
      entry.fields[fieldId][locale] =
        entry.fields[fieldId][locale].substring(0, fieldMaxLength - 1) + "…";
    }
  }

  return entry;
};

export default defineNitroPlugin(async () => {
  runtimeConfig = useRuntimeConfig();

  const contentfulClient = contentfulManagement.createClient({
    accessToken: runtimeConfig.contentful.accessToken,
  });
  const contentfulSpace = await contentfulClient.getSpace(
    runtimeConfig.contentful.space,
  );
  contentfulEnvironment = await contentfulSpace.getEnvironment(
    runtimeConfig.contentful.environment,
  );

  redisConnection = useRedis(runtimeConfig);

  new Worker("translate", translateQueueWorker, {
    connection: redisConnection,
  });

  new Worker("receive", receiveQueueWorker, {
    connection: redisConnection,
  });
});
