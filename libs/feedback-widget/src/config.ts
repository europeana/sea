import type { PropType } from "vue";

export interface FeedbackWidgetConfig {
  apiUrl: string;
  fallbackLocale: string;
  faqUrl: string | null;
  locale: string;
}

export const configProps = {
  apiUrl: {
    type: String,
    default: "https://europeana.eu",
  },
  fallbackLocale: {
    type: String,
    default: "en",
  },
  faqUrl: {
    type: String as PropType<string | null>,
    default: null,
  },
  locale: {
    type: String,
    default: "en",
  },
};
