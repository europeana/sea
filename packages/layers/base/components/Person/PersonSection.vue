<script setup>
defineProps({
  /**
   * Title for display as heading
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Description, displays under title
   */
  description: {
    type: String,
    default: null,
  },
  /**
   * List of person entries
   */
  people: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="container">
    <div v-if="title || description" class="row text-center mb-4 mb-4k-5">
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div
      class="row justify-content-center mt-4 mt-4k-5 g-4 g-4k-5 row-cols-1 row-cols-md-2 row-cols-lg-4"
    >
      <PersonCard
        v-for="(person, index) in people"
        :id="`person-${index}`"
        :key="index"
        class="col"
        :image="person.image"
        :name="person.name"
        :role="person.role"
        :email="person.email"
        :linked-in="
          /^http(s):\/\/www\.linkedin\.com/.test(person.website)
            ? person.website
            : null
        "
        :lazy="true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
</style>
