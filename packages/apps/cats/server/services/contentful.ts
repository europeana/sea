import contentfulManagement, {
  Environment as ContentfulEnvironment,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

let contentfulEnvironment: ContentfulEnvironment;

export const useContentfulEnvironment =
  async (): Promise<ContentfulEnvironment> => {
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
