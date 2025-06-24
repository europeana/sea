<script setup>
import contentfulLogoSrc from "@europeana/style/img/supporting-technical-partners/Contentful-logo.svg";
import lokaliseLogoSrc from "@europeana/style/img/supporting-technical-partners/Lokalise-logo.svg";
// TODO: ensure disclaimer logo is using translated version for current locale
import disclaimerLogoSrc from "@europeana/style/img/eu-funded/en-Funded by the EU_NEG.svg";

const localePath = useLocalePath();

// TODO: ensure links go to correct locations
const sections = {
  mission: {
    header: "footer.mission",
    text: "footer.missionStatement",
  },
  info: {
    header: "footer.info",
    links: [
      { url: "/about", text: "footer.about" },
      { url: "/news", text: "footer.news" },
      { url: "/events", text: "footer.events" },
    ],
  },
  help: {
    header: "footer.help",
    links: [
      { url: "/terms", text: "footer.terms" },
      { url: "/privacy", text: "footer.privacy" },
      { url: "/accessibility", text: "footer.accessibility" },
      { url: "/cookies", text: "footer.cookies" },
    ],
  },
  language: {
    header: "footer.language",
    text: "footer.translationInfo",
  },
  supportingPartners: {
    header: "footer.supportingPartners",
    links: [
      {
        url: "https://www.contentful.com",
        text: "footer.partners.contentful",
        image: contentfulLogoSrc,
      },
      {
        url: "https://lokalise.com",
        text: "footer.partners.lokalise",
        image: lokaliseLogoSrc,
      },
      // TODO: update when the style package contains webp files.
      // { url: "https://www.cloudflare.com/galileo/", text: "footer.partners.cloudflare", image: "@europeana/style/img/supporting-technical-partners/Galileo-logo.webp" }
    ],
  },
  disclaimer: {
    logoSrc: disclaimerLogoSrc,
    text: "footer.disclaimer",
  },
};
</script>
<template>
  <footer class="page-footer" role="contentinfo">
    <!-- TODO: make "footer-section" a distinct component? -->
    <div class="footer-section">
      <h2>
        {{ $t(sections.mission.header) }}
      </h2>
      <span>
        {{ $t(sections.mission.text) }}
      </span>
    </div>
    <div class="footer-section">
      <h2>
        {{ $t(sections.info.header) }}
      </h2>
      <ul>
        <li
          v-for="(link, index) in sections.info.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink class="nav-link label-uppercase" :to="localePath(link.url)">
            {{ $t(link.text) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <h2>
        {{ $t(sections.help.header) }}
      </h2>
      <ul>
        <li
          v-for="(link, index) in sections.help.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink class="nav-link label-uppercase" :to="localePath(link.url)">
            {{ $t(link.text) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <h2>
        {{ $t(sections.language.header) }}
      </h2>
      <!-- TODO: add language selector -->
      <span>
        <!-- TODO: add translation icon -->
        {{ $t(sections.language.text) }}
      </span>
    </div>
    <div class="footer-section">
      <h2>
        {{ $t(sections.supportingPartners.header) }}
      </h2>
      <ul>
        <li
          v-for="(link, index) in sections.supportingPartners.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink class="nav-link label-uppercase" :to="localePath(link.url)">
            <img :src="link.image" :alt="$t(link.text)" />
          </NuxtLink>
        </li>
      </ul>
    </div>
    <hr />
    <div class="footer-section">
      <img :src="sections.disclaimer.logoSrc" />
    </div>
  </footer>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.page-footer {
  @media (min-width: $bp-medium) {
  }

  @media (min-width: $bp-4k) {
  }
}
</style>
