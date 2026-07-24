<script setup>
import { inject } from "vue";

import FeedbackForm from "@/components/FeedbackForm.vue";

const i18n = inject("i18n");
</script>

<template>
  <div
    role="dialog"
    class="europeana-feedback-dialog shadow"
    content-class="shadow"
    @keydown.esc="$emit('hide')"
  >
    <div class="feedback-header">
      <h2>
        {{ i18n.t("title") }}
      </h2>
    </div>
    <FeedbackForm @hide="$emit('hide')" />
  </div>
</template>
