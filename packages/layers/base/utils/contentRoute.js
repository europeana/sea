export default function routeForType(currentRoute, type) {
  const newQuery = { ...currentRoute.query };
  delete newQuery.page;
  if (type) {
    newQuery.type = type;
  } else {
    delete newQuery.type;
  }
  return { ...currentRoute, query: newQuery };
}
