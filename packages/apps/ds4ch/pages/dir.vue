<script setup>
// NOTE: this is a temporary page for previewing live directory listing data
const field = ref(
  "https://pro-beta.europeana.eu/files/Europeana_Professional/Europeana_Network/Documents/",
);
</script>

<template>
  <div class="container my-5 pt-5">
    Selected: {{ field }}
    <FileBrowser
      v-model="field"
      class="mt-5"
      url="https://pro-beta.europeana.eu/files/Europeana_Professional/"
      :select="true"
    />
  </div>
</template>
