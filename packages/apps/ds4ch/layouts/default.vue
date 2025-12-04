<script setup>
import favIconImage from "@europeana/style/img/DS4CH/favicon.ico";

const i18nHead = useLocaleHead({
  seo: true,
});

useHead({
  link: [
    {
      rel: "icon",
      href: favIconImage,
      type: "image/x-icon",
    },
  ],
});
</script>

<template>
  <div>
    <Html :lang="i18nHead.htmlAttrs.lang" :dir="i18nHead.htmlAttrs.dir">
      <Head>
        <Title>{{ title }}</Title>
        <template v-for="link in i18nHead.link" :key="link.key">
          <Link
            :id="link.key"
            :rel="link.rel"
            :href="link.href"
            :hreflang="link.hreflang"
          />
        </template>
        <template v-for="meta in i18nHead.meta" :key="meta.key">
          <Meta
            :id="meta.key"
            :property="meta.property"
            :content="meta.content"
          />
        </template>
      </Head>
      <Body>
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
      </Body>
    </Html>
  </div>
</template>
