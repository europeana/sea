<script setup>
const props = defineProps({
  destination: {
    type: [String, Object],
    default: "",
  },
  hideExternalIcon: {
    type: Boolean,
    default: false,
  },
});

const localePath = useLocalePath();

const internalDomain = useRuntimeConfig().public.internalLinkDomain;

const isExternalLink = computed(() => {
  const path = props.destination;

  if (!internalDomain && typeof path === "string") {
    return path.startsWith("http://") || path.startsWith("https://");
  }

  const hostnamePattern = /\/\/([^/:]+)/;

  if (!hostnamePattern.test(path)) {
    return false;
  }

  const hostname = hostnamePattern.exec(path)[1];
  return !hostname.endsWith(internalDomain);
});
</script>
<template>
  <NuxtLink
    :to="localePath(destination)"
    :target="isExternalLink ? '_blank' : null"
    :external="isExternalLink"
  >
    <slot />
    <span
      v-if="isExternalLink && !props.hideExternalIcon"
      class="icon-external-link"
    />
    <span v-if="isExternalLink" class="visually-hidden">
      ({{ $t("newWindow") }})
    </span>
  </NuxtLink>
</template>
