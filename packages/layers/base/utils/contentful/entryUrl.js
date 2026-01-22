export const entryUrl = (entry) => {
  let urlPrefix;

  switch (entry["__typename"]) {
    case "BlogPosting":
      urlPrefix = "/news";
      break;
    case "ProjectPage":
      urlPrefix = "/projects";
      break;
  }

  return `${urlPrefix}/${entry.identifier}`;
};
