<script setup>
const props = defineProps({
  destination: {
    type: [String, Object],
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hideExternalIcon: {
    type: Boolean,
    default: false,
  },
});

const internalDomain = useRuntimeConfig().public.internalLinkDomain;
const route = useRoute();

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

const path = computed(() => {
  if (
    typeof props.destination === "string" &&
    props.destination.startsWith("#")
  ) {
    // NOTE: NuxtLinkLocale does not link properly when `to` prop is a string
    //       starting with '#', i.e. an anchor link.
    // TODO: stop using NuxtLinkLocale; replicate its functionality here.
    return { ...route, hash: props.destination };
  }

  return props.destination;
});
</script>
<template>
  <NuxtLinkLocale
    :to="props.disabled ? null : path"
    :target="isExternalLink ? '_blank' : null"
    :external="isExternalLink"
  >
    <slot />
    <span
      v-if="isExternalLink && !props.hideExternalIcon"
      class="icon-external-link ms-2"
    />
    <span v-if="isExternalLink" class="visually-hidden">
      ({{ $t("newWindow") }})
    </span>
  </NuxtLinkLocale>
</template>
