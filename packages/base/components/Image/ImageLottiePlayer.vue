<script setup>
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const lottiePlayer = ref(null);
const intersecting = ref(false);

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      intersecting.value = entry.isIntersecting || entry.intersectionRatio > 0;
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
  <DotLottieVue ref="lottiePlayer" :src="props.src" :autoplay="intersecting" />
</template>
