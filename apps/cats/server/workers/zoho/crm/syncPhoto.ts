import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { AssetProps } from "contentful-management";

import { useContentfulClient } from "@/utils/contentful";
import { useZoho } from "@/utils/zoho";

export { name as queueName } from "@/queues/zoho/crm/syncPhoto";

export const processor = async (
  job: Job,
): Promise<{ assetId: string | null }> => {
  const contactId = job.data.contactId;
  const zohoPhoto = await useZoho().crm.fetchZohoPhoto(contactId);

  if (!zohoPhoto) {
    return { assetId: null };
  }

  const contentfulClient = useContentfulClient();

  const contentfulAssetId = `zoho-contact-photo-${contactId}`;
  let contentfulAsset: AssetProps;

  const contentfulUpload = await contentfulClient.upload.create(
    {},
    {
      file: zohoPhoto.file,
    },
  );

  const locale = useRuntimeConfig().contentful.defaultLocale;

  const fields = {
    title: {
      [locale]: `Zoho CRM Contact photo: ${contactId}`,
    },
    description: {
      [locale]: "",
    },
    file: {
      [locale]: {
        contentType: zohoPhoto.contentType,
        fileName: zohoPhoto.fileName,
        uploadFrom: {
          sys: {
            type: "Link" as const,
            linkType: "Upload" as const,
            id: contentfulUpload.sys.id,
          },
        },
      },
    },
  };

  try {
    contentfulAsset = await contentfulClient.asset.get({
      assetId: contentfulAssetId,
    });
    contentfulAsset.fields = fields;
    contentfulAsset = await contentfulClient.asset.update(
      { assetId: contentfulAsset.sys.id },
      contentfulAsset,
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "NotFound") {
      // asset not found, so let's create one
      contentfulAsset = await contentfulClient.asset.createWithId(
        { assetId: contentfulAssetId },
        {
          fields,
        },
      );
    } else {
      throw err;
    }
  }

  contentfulAsset = await contentfulClient.asset.processForAllLocales(
    {},
    contentfulAsset,
  );
  await contentfulClient.asset.publish(
    { assetId: contentfulAsset.sys.id },
    contentfulAsset,
  );

  return { assetId: contentfulAsset.sys.id };
};

export const opts = {};
