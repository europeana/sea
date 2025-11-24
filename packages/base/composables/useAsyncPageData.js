import { createHttpError } from "./error.js";
import { ref } from "vue";

export const useAsyncPageData = async (key, handler, options) => {
  const { data, error } = await useAsyncData(key, handler, options);

  if (error.value) {
    if (error.value.statusCode) {
      throw createHttpError(error.value.statusCode);
    }
    throw error.value;
  }

  const page = data.value.page;
  if (!page) {
    throw createHttpError(404);
  }

  return { page: ref(page) };
};
