import { computed } from "vue";

const matomo = computed(() => window?.Piwik?.getAsyncTracker());

export const useMatomo = () => {
  return {
    matomo,
  };
};
