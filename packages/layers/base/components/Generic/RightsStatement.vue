<script setup>
import rightsNameAndIcon from "../../utils/rightsStatement.js";

const props = defineProps({
  rightsStatementUrl: {
    type: String,
    required: true,
  },
  /**
   * Style variant to use
   * @values icons, simple
   */
  variant: {
    type: String,
    default: "icons",
  },
});

const rightsStatementData = computed(() =>
  rightsNameAndIcon(props.rightsStatementUrl),
);
</script>

<template>
  <span
    data-qa="rights statement"
    class="license-label d-inline-flex align-items-center"
    :class="{ 'text-uppercase': props.variant === 'simple' }"
  >
    <template v-if="props.variant === 'icons'">
      <span
        v-for="icon in rightsStatementData.iconClass"
        :key="icon"
        :class="icon"
        class="license"
      />
    </template>
    <span v-else class="icon-license" />
    <span class="license-label-text">
      {{ rightsStatementData.name }}
    </span>
  </span>
</template>
