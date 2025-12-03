<template>
  <div class="landing-page xxl-page">
    <NuxtRouteAnnouncer />
    <div
      id="toaster-bottom-left"
      class="toast-container position-fixed bottom-0 ms-2 ms-sm-4 mb-2 mb-sm-4"
    >
      <!-- Keep at the top of page for easy keyboard a11y -->
      <CookiesWidget />
    </div>
    <a class="skip-main" href="#main">
      {{ $t("skipToMainContent") }}
    </a>
    <PageHeader />
    <main id="main" role="main">
      <slot />
    </main>
    <PageFooter />
  </div>
</template>
