<script setup>
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const lottiePlayer = ref(null);
const played = ref(false);
const intersecting = ref(false);

let observer;

onMounted(() => {
  const playerInstance = lottiePlayer.value?.getDotLottieInstance();

  function playHandler() {
    played.value = true;
    playerInstance.removeEventListener("play", playHandler);
  }
  playerInstance.addEventListener("play", playHandler);

  function loadHandler() {
    // Play Lottie when in viewport on initial render
    if (intersecting.value) {
      playerInstance.play();
    }
  }
  playerInstance.addEventListener("load", loadHandler);

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        intersecting.value = true;
        // If Lottie not yet played at initial render, play when intersecting
        if (!played.value) {
          playerInstance.play();
        }
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
  <DotLottieVue ref="lottiePlayer" :src="props.src" />
</template>
