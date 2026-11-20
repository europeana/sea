export const entryHasTaxonomyTerm = (entry, termId) => {
  return (entry.contentfulMetadata?.concepts || []).some(
    (concept) => concept.id === termId,
  );
};
