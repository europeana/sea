export const entryUrl = (entry) => {
  let urlPrefix;

  switch (entry["__typename"]) {
    case "BlogPosting":
      urlPrefix = "/news";
      break;
    case "ProjectPage":
      urlPrefix = "/projects";
      break;
    case "ExhibitionPage":
      urlPrefix = "/exhibitions";
      break;
    case "Story":
      urlPrefix = "/stories";
      break;
  }

  return `${urlPrefix}/${entry.identifier}`;
};
