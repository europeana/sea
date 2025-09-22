import fetch from "node-fetch-native";

export const requestTranslation = async ({
  externalReference,
  html,
  sourceLanguage = "EN",
}) => {
  const config = useRuntimeConfig().eTranslation;

  const requestBody = {
    callerInformation: {
      externalReference,
    },
    documentToTranslate: {
      document: {
        format: "html",
        content: Buffer.from(html).toString("base64"),
      },
    },
    sourceLanguage,
    targetLanguages,
    deliveries: {
      http: config.deliveries,
    },
  };

  const basicAuth = Buffer.from(
    `${config.username}:${config.password}`,
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
