<script setup>
const logoSrc = '/img/logo.svg';

// TODO: populate URLs when pages exist
const links = [
  { url: '/', text: 'nav.home' },
  { url: '/', text: 'nav.about' },
  { url: '/', text: 'nav.exploreDataspace' },
  { url: '/', text: 'nav.exploreData' }
]
</script>
<template>
  <nav role="navigation" class="navbar navbar-expand-lg fixed-top">
    <NuxtLink to="/" class="navbar-brand">
      <img :src="logoSrc" :alt="$t('home')">
    </NuxtLink>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-navbar"
      aria-controls="offcanvas-navbar" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="offcanvas offcanvas-end" id="offcanvas-navbar" tabindex="-1">
      <div class="offcanvas-header">
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
      </div>
      <div class="offcanvas-body">
        <ul class="navbar-nav">
          <li v-for="(link, index) in links" :key="index" class="nav-item">
            <NuxtLink class="nav-link" :to="link.url">{{ $t(link.text) }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
