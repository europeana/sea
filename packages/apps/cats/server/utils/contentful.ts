import contentfulManagement, {
  Entry,
  Environment,
  QueryOptions,
  KeyValueMap,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

let environment: Environment;

export const useContentfulEnvironment = async (): Promise<Environment> => {
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
  contentTypeId: string,
  query: QueryOptions,
  fields: KeyValueMap,
  publish: boolean = true,
): Promise<Entry | null> => {
  let entry = await findEntry(query);

  fields = await omitInvalidArrayFieldValues(contentTypeId, fields);

  if (entry) {
    entry.fields = {
      ...entry.fields,
      ...fields,
    };
    entry = await entry.update();
  } else {
    entry = await environment.createEntry(contentTypeId, {
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
  const environment = await useContentfulEnvironment();
  const response = await environment.getEntries(query);

  // TODO: handle more than 1? i.e. update all?
  if (response.total === 1) {
    return response.items[0];
  }

  return null;
};

const omitInvalidArrayFieldValues = async (
  contentTypeId: string,
  fields: KeyValueMap,
): Promise<KeyValueMap> => {
  const environment = await useContentfulEnvironment();
  const contentType = await environment.getContentType(contentTypeId);
  const locale = useRuntimeConfig().contentful?.defaultLocale;

  for (const contentTypeField of contentType.fields) {
    if (fields[contentTypeField.id] && contentTypeField.type === "Array") {
      const inValidation = contentTypeField.items?.validations?.find(
        (validation) => validation.in,
      );

      if (inValidation) {
        fields[contentTypeField.id][locale] = fields[contentTypeField.id][
          locale
        ]?.filter((value) => inValidation.in.includes(value));
      }
    }
  }

  return fields;
};
