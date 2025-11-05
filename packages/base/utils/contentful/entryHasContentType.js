export const entryHasContentType = (entry, contentType) => {
  return entry?.__typename === contentType;
};
