import contentfulManagement from "contentful-management";

let contentfulEnvironment;

export const useContentfulEnvironment = async () => {
  if (!contentfulEnvironment) {
    const runtimeConfig = useRuntimeConfig();

    const contentfulClient = contentfulManagement.createClient({
      accessToken: runtimeConfig.contentful.accessToken,
    });
    const contentfulSpace = await contentfulClient.getSpace(
      runtimeConfig.contentful.space,
    );
    contentfulEnvironment = await contentfulSpace.getEnvironment(
      runtimeConfig.contentful.environment,
    );
  }

  return contentfulEnvironment;
};
