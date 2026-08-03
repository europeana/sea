import { onMounted, toRef, watch } from "vue";

export const useLocationHash = ({ centre, elementId, zoom }) => {
  const centreRef = toRef(centre);
  const elementIdRef = toRef(elementId);
  const zoomRef = toRef(zoom);

  const initFromHash = () => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashId = hashParams.get("em-id");
      if (hashId !== elementIdRef.value) {
        // there may be multiple maps on the page, but only 1 active & tracked via the URL hash
        return;
      }
      const hashCentre = hashParams.get("em-c");
      const hashZoom = hashParams.get("em-z");

      if (hashCentre) {
        centreRef.value = hashCentre.split(",").map(Number);
      }
      if (hashZoom) {
        zoomRef.value = Number(hashZoom);
      }
      if (hashCentre || hashZoom) {
        document.getElementById(elementIdRef.value)?.scrollIntoView();
      }
    }
  };

  const updateLocationHash = () => {
    const hashParams = new URLSearchParams({
      "em-id": elementIdRef.value,
      "em-c": centreRef.value?.join(","),
      "em-z": zoomRef.value,
    }).toString();
    const url = new URL(window.location);
    url.hash = `#${hashParams}`;

    window.location.replace(url);
  };

  onMounted(() => {
    initFromHash();
    watch([centreRef, zoomRef], updateLocationHash);
  });
};
