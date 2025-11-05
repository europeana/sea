export const entryHasContentType = (
  entry: { __typename: string },
  contentType: string,
): boolean => {
  return entry?.__typename === contentType;
};
