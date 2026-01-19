import { merge } from "lodash-es";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { onMounted, ref } from "vue";

/**
 * Initialises a swiper on any element matching the .swiper class.
 * Additional configuration options can be passed as a param and will
 * be merged with the base options.
 */
export default function useSwiper(swiperOptions) {
  const { t } = useI18n();
  const swiperReady = ref(false);
  const swiperDefaultOptions = {
    a11y: {
      enabled: true,
      firstSlideMessage: t("swiper.a11y.firstSlide"),
      lastSlideMessage: t("swiper.a11y.lastSlide"),
      nextSlideMessage: t("swiper.a11y.nextSlide"),
      paginationBulletMessage: t("swiper.a11y.paginationBullet", {
        page: "{{index}}",
      }),
      prevSlideMessage: t("swiper.a11y.previousSlide"),
      slideLabelMessage: t("swiper.a11y.slideLabel", {
        slide: "{{index}}",
        totalSlides: "{{slidesLength}}",
      }),
    },
    keyboard: {
      enabled: true,
      pageUpDown: false,
    },
    lazy: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    on: {
      afterInit: () => {
        swiperReady.value = true;
      },
    },
    pagination: {
      clickable: true,
      el: ".swiper-pagination",
      type: "bullets",
    },
    slidesPerView: "auto",
  };

  onMounted(() => {
    // does this need to be cleaned up on unmounted?
    new Swiper(".swiper", merge(swiperDefaultOptions, swiperOptions));
  });

  return {
    swiperReady,
  };
}
