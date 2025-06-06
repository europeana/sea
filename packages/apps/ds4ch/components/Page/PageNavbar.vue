<script setup>
import logoSrc from "@europeana/style/img/DS4CH/logo.svg";

// TODO: populate URLs when pages exist and translation strings when i18n configured
const links = [
  { url: "/", text: "Home" },
  { url: "/about", text: "About us" },
  { url: "/data-space", text: "Explore the Data space" },
  { url: "/data", text: "Explore the data" },
];
</script>
<template>
  <nav role="navigation" class="navbar navbar-expand-lg">
    <NuxtLink to="/" class="navbar-brand">
      <img :src="logoSrc" alt="Home" />
    </NuxtLink>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvas-navbar"
      aria-controls="offcanvas-navbar"
      aria-label="Toggle navigation"
    >
      <span class="icon-menu text-white"></span>
    </button>
    <div class="offcanvas offcanvas-end bg-dark border-start border-light" id="offcanvas-navbar" tabindex="-1">
      <div class="offcanvas-header">
        <button
          type="button"
          class="btn-close icon-clear"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
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
  --bs-navbar-toggler-padding-y: 0.75rem;

  @media (min-width: $bp-medium) {
    --bs-navbar-padding-x: 3.5rem;
  }

  @media (min-width: $bp-4k) {
    --bs-navbar-padding-x: 7rem;
    --bs-navbar-padding-y: 1.25rem;
  }
}

.navbar-brand {
  @media (max-width: ($bp-large - 1px)) {
    margin-left: -0.5rem;
  }

  img {
    height: 4rem;

    @media (min-width: $bp-4k) {
      height: 8rem;
    }
  }
}

.navbar-nav {
  --bs-nav-link-padding-y: 0.75rem;
}

.nav-link {
  color: $white;
  transition: color $standard-transition;

  &.router-link-exact-active,
  &:hover {
    color: $yellow;
  }
}

.navbar-expand-lg .navbar-nav .nav-link {
  @media (min-width: $bp-4k) {
    padding: 1rem;
  }
}

.navbar-toggler {
  --bs-navbar-toggler-font-size: 0.75rem;
  margin-right: -0.75rem;

  &:focus {
    box-shadow: none;
  }

  .icon-menu {
    line-height: 1rem;
    display: inline-block;
  }
}

.offcanvas {
  --bs-offcanvas-width: 16rem;

  .btn-close {
    --bs-btn-close-color: #{$white};
    --bs-btn-close-opacity: 1;
    --bs-btn-close-hover-opacity: 1;

    &:hover {
      color: $yellow;
    }
  }
}
</style>
