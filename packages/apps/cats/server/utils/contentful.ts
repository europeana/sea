import contentfulManagement, {
  Entry,
  Environment,
  QueryOptions,
  KeyValueMap,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

let environment: Environment;

export const useEnvironment = async (): Promise<Environment> => {
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

export const createOrUpdateEntry = async (
  contentType: string,
  query: QueryOptions,
  fields: KeyValueMap,
  publish: boolean = true,
): Promise<Entry | null> => {
  let entry = await findEntry(query);

  if (entry) {
    entry.fields = {
      ...entry.fields,
      ...fields,
    };
    entry = await entry.update();
  } else {
    const contentfulEnvironment = await useEnvironment();
    entry = await contentfulEnvironment.createEntry(contentType, {
      fields,
    });
  }

  if (entry) {
    if (publish) {
      await entry.publish();
    }
    return entry;
  }

  return null;
};

export const findEntry = async (query: QueryOptions): Promise<Entry | null> => {
  const contentfulEnvironment = await useEnvironment();
  const response = await contentfulEnvironment.getEntries(query);

  // TODO: handle more than 1? i.e. update all?
  if (response.total === 1) {
    return response.items[0];
  }

  return null;
};
