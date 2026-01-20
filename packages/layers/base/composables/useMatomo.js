import { computed } from "vue";

const matomo = computed(() => window?.Matomo?.getAsyncTracker());

export const useMatomo = () => {
  return {
    matomo,
  };
};
