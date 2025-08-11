export default defineEventHandler(async () => {
  return await useStorage("redis").getItem("items:type-counts");
});
