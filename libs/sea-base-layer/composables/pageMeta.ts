import { optimisedSrc } from "../utils/contentful/assets.js";

const pageMetaContentfulImageParams = {
  w: 1200,
  h: 630,
  fit: "fill",
  f: "face",
};

export const usePageMeta = (data: {
  title: string;
  description: string;
  image: { url: string; description: string | null } | null;
  ogType: "article" | undefined; // extend types as needed
}) => {
  useSeoMeta({
    title: data.title,
    description: data.description,
    ogTitle: data.title,
    ogDescription: data.description,
    ogImage: optimisedSrc(data.image, pageMetaContentfulImageParams),
    ogImageAlt: data.image?.description,
    ogType: data.ogType,
  });
};
