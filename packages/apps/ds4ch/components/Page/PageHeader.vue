<script setup>
  const logoSrc = '/img/logo.svg';
</script>

<template>
  <header id="header" role="banner">
    <nav role="navigation" class="navbar navbar-expand-lg fixed-top">
      <NuxtLink to="/" class="logo d-inline-flex">
        <img :src="logoSrc" alt="Home" data-qa="logo">
      </NuxtLink>
      <button
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="offcanvas" 
        data-bs-target="#offcanvas-navbar" 
        aria-controls="offcanvas-navbar" 
        aria-label="Toggle navigation"
      >
          <span class="navbar-toggler-icon"></span>
      </button>
      <div 
        class="offcanvas offcanvas-end"
        id="offcanvas-navbar"
        tabindex="-1"
      >
          <div class="offcanvas-header">
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
          </div>
          <div class="offcanvas-body">
            <PageNavigation />
          </div>
      </div>
    </nav>
  </header>
</template>
