import contentfulManagement, {
  Environment as ContentfulEnvironment,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

let environment: ContentfulEnvironment;

export const useContentfulEnvironment =
  async (): Promise<ContentfulEnvironment> => {
    if (!environment) {
      const config = useRuntimeConfig()?.contentful;

      const client = contentfulManagement.createClient({
        accessToken: config.accessToken,
      });
      const space = await client.getSpace(config.space);
      environment = await space.getEnvironment(config.environment);
    }

    return environment;
  };
