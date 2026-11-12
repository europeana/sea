<script setup>
useHead({
  title: "Europeana Contentful apps",
});

const items = [
  {
    to: { name: "disabled-single-line" },
    title: "Disabled single line text",
    description:
      "Standard single line text input field, but always disabled, e.g. for derived fields",
  },
  {
    to: { name: "document-linker" },
    title: "Document linker",
    description:
      "Browse directories on a NGINX file server to link to a content entry",
  },
];
</script>

<template>
  <h1>Europeana Contentful apps</h1>
  <ol>
    <li v-for="(item, index) in items" :key="index">
      <nuxt-link :to="item.to">
        {{ item.title }}
      </nuxt-link>
      — {{ item.description }}
    </li>
  </ol>
</template>
