<script setup>
import parseMarkdown from "../../utils/markdown/parse.js";

defineProps({
  /**
   * Title for display as heading
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Heading title level to use. Override default for when used in subsection to keep correct heading structure.
   */
  titleTag: {
    type: String,
    default: "h2",
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
  /**
   * Show or hide person contact buttons
   */
  showContactButtons: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div>
    <div v-if="title || description" class="row text-center mb-4 mb-4k-5">
      <component :is="titleTag" v-if="title">{{ title }}</component>
      <!-- eslint-disable vue/no-v-html -->
      <p v-if="description" v-html="parseMarkdown(description)" />
      <!-- eslint-enable vue/no-v-html -->
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
        :website="person.url"
        :show-contact-buttons="showContactButtons"
        :lazy="true"
      />
    </div>
  </div>
</template>
