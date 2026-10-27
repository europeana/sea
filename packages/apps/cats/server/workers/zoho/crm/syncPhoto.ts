import { Job } from "bullmq";
import { useRuntimeConfig } from "nitropack/runtime";
import { Asset as ContentfulAsset } from "contentful-management";

import { fetchZohoPhoto } from "@/services/zoho/crm";
import { useContentfulEnvironment } from "@/services/contentful";

export { name, processor, opts };

const name = "zoho-crm-sync-photo";

const processor = async (job: Job): Promise<{ assetId: string | null }> => {
  const contactId = job.data.contactId;
  const zohoPhoto = await fetchZohoPhoto(contactId);

  if (!zohoPhoto) {
    return { assetId: null };
  }

  const contentfulEnvironment = await useContentfulEnvironment();

  const contentfulAssetId = `zoho-contact-photo-${contactId}`;
  let contentfulAsset: ContentfulAsset;

  const contentfulUpload = await contentfulEnvironment.createUpload({
    file: zohoPhoto.file,
  });

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
            type: "Link",
            linkType: "Upload",
            id: contentfulUpload.sys.id,
          },
        },
      },
    },
  };

  try {
    contentfulAsset = await contentfulEnvironment.getAsset(contentfulAssetId);
    contentfulAsset.fields = fields;
    await contentfulAsset.update();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "NotFound") {
      // asset not found, so let's create one
      contentfulAsset = await contentfulEnvironment.createAssetWithId(
        contentfulAssetId,
        {
          fields,
        },
      );
    } else {
      throw err;
    }
  }

  contentfulAsset = await contentfulAsset.processForAllLocales();
  await contentfulAsset.publish();

  return { assetId: contentfulAsset.sys.id };
};

const opts = {
  removeOnComplete: { count: 100 },
  // removeOnFail: { count: 5000 },
};
