import { entryHasContentType } from "./index.js";

export const deepFindEntriesOfType = (items = [], type) =>
  items
    .map((item) => {
      if (entryHasContentType(item, type)) {
        return item;
      } else if (item.hasPartCollection) {
        return deepFindEntriesOfType(item.hasPartCollection.items, type);
      } else {
        return null;
      }
    })
    .flat()
    .filter(Boolean);
