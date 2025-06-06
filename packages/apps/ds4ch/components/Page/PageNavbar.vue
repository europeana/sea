<script setup>
const logoSrc = '/img/logo.svg';

// TODO: populate URLs when pages exist and translation strings when i18n configured
const links = [
  { url: '/', text: 'Home' },
  { url: '/about', text: 'About us' },
  { url: '/data-space', text: 'Explore the Data space' },
  { url: '/data', text: 'Explore the data' }
]
</script>
<template>
  <nav role="navigation" class="navbar navbar-expand-lg">
    <NuxtLink to="/" class="navbar-brand">
      <img :src="logoSrc" alt="Home">
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
        <ul class="navbar-nav ms-auto">
          <li v-for="(link, index) in links" :key="index" class="nav-item">
            <NuxtLink class="nav-link label-uppercase" :to="link.url">{{ link.text }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@import '@europeana/style/scss/variables';
@import 'assets/scss/variables';

.navbar {
  --bs-navbar-padding-x: 2rem;
  --bs-navbar-padding-y: 0.625rem;
  --bs-navbar-brand-padding-y: 0;

  @media (min-width: $bp-medium) {
    --bs-navbar-padding-x: 3.5rem;
  }

  @media (min-width: $bp-4k) {
    --bs-navbar-padding-x: 7rem;
    --bs-navbar-padding-y: 1.25rem;
  }
}

.navbar-brand img {
  height: 4rem;

  @media (min-width: $bp-4k) {
    height: 8rem;
  }
}

.nav-link {
  color: $white;

  &.router-link-exact-active,
  &:hover {
    color: $yellow;
    transition: $standard-transition;
  }
}

.navbar-expand-lg .navbar-nav .nav-link {
  @media (min-width: $bp-4k) {
    padding: 1rem;
  }
}
</style>
