import { ref } from "vue";
import { useFetch } from "@vueuse/core";

export const useMapData = ({ json, url } = {}) => {
  const data = ref(null);

  if (json) {
    data.value = JSON.parse(json);
  } else if (url) {
    useFetch(url)
      .json()
      .then((fetched) => {
        data.value = fetched.data.value;
      });
  } else {
    throw new Error("No data JSON or URL supplied.");
  }

  return { data };
};
