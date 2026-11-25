import {
  createClient,
  CreateEntryProps,
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
  params: {
    contentTypeId: string;
    entryId?: string;
  },
  query: QueryOptions,
  entryProps: CreateEntryProps,
  publish: boolean = true,
): Promise<EntryProps<KeyValueMap> | null> => {
  const client = useContentfulClient();
  let entry = await findEntry(query);

  if (entry) {
    entry.fields = {
      ...entry.fields,
      ...entryProps.fields,
    };
    entry = await client.entry.update({ entryId: entry.sys.id }, entry);
  } else {
    if (params.entryId) {
      entry = await client.entry.createWithId(
        params as {
          contentTypeId: string;
          entryId: string;
        },
        entryProps,
      );
    } else {
      entry = await client.entry.create(params, entryProps);
    }
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
