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
      <CardTestimonialCard
        v-if="card['__typename'] === 'TestimonialCard'"
        :testimonial-text="card.text"
        :attribution="card.attribution"
      />
    </div>
  </div>
</template>
