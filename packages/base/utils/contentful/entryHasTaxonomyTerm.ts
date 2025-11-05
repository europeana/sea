export const entryHasTaxonomyTerm = (
  entry: { contentfulMetadata: { concepts: Array<{ id: string }> } },
  termId: string,
): boolean => {
  return (entry.contentfulMetadata?.concepts || []).some(
    (concept) => concept.id === termId,
  );
};
