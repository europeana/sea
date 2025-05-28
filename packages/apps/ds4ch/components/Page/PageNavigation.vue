<script setup>
  const links = [
    { url: '/', text: 'Home' },
    { url: '/', text: 'About us' },
    { url: '/', text: 'Explore the Data space' },
    { url: '/', text: 'Explore the data' }
  ]
</script>

<template>
  <ul class="navbar-nav">
    <li 
      v-for="(link, index) in links"
      :key="index"
      class="nav-item"
    >
      <NuxtLink class="nav-link" :to="link.url">{{ link.text }}</NuxtLink>
    </li>
  </ul>
</template>
