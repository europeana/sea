<script setup>
const props = defineProps({
  quoteText: {
    type: String,
    default: null,
  },
  initials: {
    type: String,
    default: null,
  },
  organisation: {
    type: String,
    default: null,
  },
});

const caption = computed(() => {
  if (props.initials && props.organisation) {
    return `- ${props.initials}, ${props.organisation}`;
  } else if (props.initials || props.organisation) {
    return `- ${props.initials || props.organisation}`;
  } else {
    return null;
  }
});
</script>
<template>
  <div class="card">
    <div class="card-body">
      <span class="icon-quote d-inline-block mb-4" />
      <figure>
        <blockquote class="mx-0 mb-4 fst-normal">
          <p>{{ props.quoteText }}</p>
        </blockquote>
        <figcaption v-if="caption" class="fw-semibold">
          {{ caption }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.card {
  --bs-border-width: 0;
  max-width: $max-card-width;
}

.icon-quote {
  font-size: $font-size-24;
}

blockquote {
  p:before,
  p:after {
    content: none;
  }
}
</style>
