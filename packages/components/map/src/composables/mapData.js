import { ref, watchEffect } from "vue";
import { useFetch } from "@vueuse/core";

const centreOfEurope = [9.254419, 50.102223];

export const useMapData = ({ json, url }) => {
  const centre = ref(centreOfEurope);
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

  watchEffect(() => {
    if (data.value?.features.length === 1) {
      centre.value = data.value.features[0].geometry.coordinates;
    }
  });

  return { data, centre };
};
