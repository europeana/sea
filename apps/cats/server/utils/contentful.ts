import {
  createClient,
  EntryProps,
  PlainClientAPI,
  QueryOptions,
  KeyValueMap,
} from "contentful-management";
import { useRuntimeConfig } from "nitropack/runtime";

let client: PlainClientAPI;

export const useContentfulClient = (): PlainClientAPI => {
  if (!client) {
    const config = useRuntimeConfig()?.contentful;

    client = createClient(
      {
        accessToken: config.accessToken,
      },
      {
        defaults: {
          spaceId: config.space,
          environmentId: config.environment,
        },
      },
    );
  }

  return client;
};

export const createOrUpdateEntry = async (
  contentTypeId: string,
  query: QueryOptions,
  fields: KeyValueMap,
  publish: boolean = true,
): Promise<EntryProps<KeyValueMap> | null> => {
  const client = useContentfulClient();
  let entry = await findEntry(query);

  fields = await omitInvalidArrayFieldValues(contentTypeId, fields);

  if (entry) {
    entry.fields = {
      ...entry.fields,
      ...fields,
    };
    entry = await client.entry.update({ entryId: entry.sys.id }, entry);
  } else {
    entry = await client.entry.create({ contentTypeId }, { fields });
  }

  if (entry) {
    if (publish) {
      await client.entry.publish({ entryId: entry.sys.id }, entry);
    }
    return entry;
  }

  return null;
};

export const findEntry = async (
  query: QueryOptions,
): Promise<EntryProps<KeyValueMap> | null> => {
  const client = useContentfulClient();

  const response = await client.entry.getMany({ query });

  return response.items?.[0] || null;
};

const omitInvalidArrayFieldValues = async (
  contentTypeId: string,
  fields: KeyValueMap,
): Promise<KeyValueMap> => {
  const client = useContentfulClient();
  const contentType = await client.contentType.get({ contentTypeId });
  const locale = useRuntimeConfig().contentful?.defaultLocale;

  for (const contentTypeField of contentType.fields) {
    if (
      Array.isArray(fields[contentTypeField.id]?.[locale]) &&
      contentTypeField.type === "Array"
    ) {
      const inValidation = contentTypeField.items?.validations?.find(
        (validation) => validation.in,
      );

      if (inValidation) {
        fields[contentTypeField.id][locale] = fields[contentTypeField.id][
          locale
        ].filter((value) => inValidation.in?.includes(value));
      }
    }
  }

  return fields;
};
