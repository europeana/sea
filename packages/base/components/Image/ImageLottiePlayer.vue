<script setup>
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const lottiePlayer = ref(null);
const loadSrc = ref(null);

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        loadSrc.value = props.src;
      }
    },
    {
      threshold: 0.5,
    },
  );

  if (lottiePlayer.value.$el) {
    observer.observe(lottiePlayer.value.$el);
  }
});

onBeforeUnmount(() => {
  if (observer && lottiePlayer.value.$el) {
    observer.unobserve(lottiePlayer.value.$el);
  }
});
</script>

<template>
  <DotLottieVue ref="lottiePlayer" autoplay :src="loadSrc" />
</template>
