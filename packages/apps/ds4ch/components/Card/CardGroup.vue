<script setup>
const props = defineProps({
  cards: {
    type: Array,
    default: null,
  },
});
</script>
<template>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    <div v-for="(card, index) in props.cards" :key="index" class="col">
      <CardQuoteCard
        v-if="card.variant === 'quote'"
        :quote-text="card.quoteText"
        :initials="card.initials"
        :organisation="card.organisation"
      />
    </div>
  </div>
</template>
