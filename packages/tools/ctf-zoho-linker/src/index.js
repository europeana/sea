import fetch from "node-fetch-native";

const queryContentfulGraphql = async (query, variables) => {
  const url = new URL(
    `/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
    "https://graphql.contentful.com",
  );
  url.searchParams.set(
    "access_token",
    variables.preview
      ? process.env.CONTENTFUL_ACCESS_TOKEN_PREVIEW
      : process.env.CONTENTFUL_ACCESS_TOKEN_DELIVERY,
  );

  const contentfulResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await contentfulResponse.json();

  return json;
};

const fetchContentfulPersonEntries = async () => {
  const query = `
    query persons(
      $locale: String!
      $preview: Boolean = false
    ) {
      personCollection(
        preview: $preview
        locale: $locale
        limit: 1000
        order: name_ASC
      ) {
        total
        
        items {
          sys {
            id
          }
          name
          affiliation
          url
        }
      }
    }
  `;
  const variables = {
    preview: true,
    locale: "en-GB",
  };

  const json = await queryContentfulGraphql(query, variables);

  const entries = json.data.personCollection.items;

  return entries;
};

const countEntriesLinkingToPersonEntry = async (entryId) => {
  const query = `
    query personLinks(
      $id: String!
      $locale: String!
      $preview: Boolean = false
    ) {
      personCollection(
        preview: $preview
        locale: $locale
        limit: 10
        where: {
          sys: {
            id: $id
          }
        }
      ) {
        items {
          linkedFrom {
            blogPostingCollection {
              total
            }
            storyCollection {
              total
            }
          }
        }
      }
    }
  `;
  const variables = {
    id: entryId,
    preview: true,
    locale: "en-GB",
  };

  const json = await queryContentfulGraphql(query, variables);

  const linkedFrom = json.data.personCollection.items[0].linkedFrom;

  return linkedFrom;
};

export const dupes = async () => {
  const personEntries = await fetchContentfulPersonEntries();

  const nameEntries = {};
  for (const person of personEntries) {
    const trimmedName = person.name?.trim() || null;
    nameEntries[trimmedName] ||= [];
    nameEntries[trimmedName].push(person.sys.id);
  }

  console.log("Name,URL,Blog posts,Stories");

  for (const trimmedName in nameEntries) {
    if (nameEntries[trimmedName].length > 1) {
      for (const id of nameEntries[trimmedName]) {
        const url = `https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/entries/${id}`;
        const linkedFrom = await countEntriesLinkingToPersonEntry(id);
        console.log(
          `${trimmedName},${url},${linkedFrom.blogPostingCollection.total},${linkedFrom.storyCollection.total}`,
        );
      }
    }
  }
};

const getZohoAccessToken = async () => {
  const url = new URL("/oauth/v2/token", "https://accounts.zoho.eu");
  url.searchParams.set("client_id", process.env.ZOHO_CLIENT_ID);
  url.searchParams.set("client_secret", process.env.ZOHO_CLIENT_SECRET);
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("scope", "ZohoCRM.modules.ALL");
  url.searchParams.set("soid", `ZohoCRM.${process.env.ZOHO_SOID}`);

  const zohoAuthResponse = await fetch(url, {
    method: "POST",
  });
  const json = await zohoAuthResponse.json();

  return json["access_token"];
};

let accessToken;
const searchZohoForContactByName = async (name) => {
  if (!accessToken) {
    accessToken = await getZohoAccessToken();
  }

  const url = new URL("/crm/v8/Contacts/search", "https://www.zohoapis.eu");
  url.searchParams.set("criteria", `Full_Name:equals:${name}`);
  url.searchParams.set("fields", "id,Full_Name");

  const zohoSearchResponse = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (!zohoSearchResponse.body) {
    // indicates no record found
    return 0;
  }

  const json = await zohoSearchResponse.json();

  const zohoContactMatches = json.data.filter(
    (item) => item["Full_Name"] === name,
  );

  if (zohoContactMatches?.length === 0) {
    return 0;
  } else if (zohoContactMatches?.length === 1) {
    return zohoContactMatches[0].id;
  } else {
    // indicates multiple records found
    return -1;
  }
};

export const findZohoIds = async () => {
  const personEntries = await fetchContentfulPersonEntries();

  for (const person of personEntries) {
    const trimmedName = person.name?.trim() || null;
    if (trimmedName) {
      const zohoContactId = await searchZohoForContactByName(trimmedName);

      console.log(`"${trimmedName}",${zohoContactId}`);
    }
  }
};

export const main = () => {
  findZohoIds();
};

main();
