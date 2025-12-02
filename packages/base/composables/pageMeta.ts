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
    ogImage: data.image?.url,
    ogImageAlt: data.image?.description,
    ogType: data.ogType,
  });
};
