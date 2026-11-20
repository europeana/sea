<script setup lang="ts">
// TODO: move to own package: @europeana/vue-text-interpolation
import { computed, useSlots } from "vue";

const props = withDefaults(
  defineProps<{
    tag?: string;
    text: string;
  }>(),
  {
    tag: "span",
  },
);

const slots = useSlots();

const parts = computed(() => {
  const slotNames = Object.keys(slots);
  if (slotNames.length === 0) {
    return [props.text];
  }

  return props.text.split(new RegExp(`({${slotNames.join("}|{")}})`));
});

const slotNameForChunk = (chunk: string): string | null => {
  const match = chunk.match(/^\{(.+)\}$/);
  if (match && match[1] in slots) {
    return match[1];
  }
  return null;
};
</script>

<template>
  <component :is="tag">
    <template v-for="(chunk, index) in parts" :key="index">
      <slot v-if="slotNameForChunk(chunk)" :name="slotNameForChunk(chunk)!" />
      <template v-else>{{ chunk }}</template>
    </template>
  </component>
</template>
