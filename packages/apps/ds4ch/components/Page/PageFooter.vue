<script setup>
import contentfulLogoSrc from "@europeana/style/img/supporting-technical-partners/Contentful-logo.svg";
import lokaliseLogoSrc from "@europeana/style/img/supporting-technical-partners/Lokalise-logo.svg";
import galileoLogoSrc from "@europeana/style/img/supporting-technical-partners/Galileo-logo.webp";
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
      { url: "/", text: "footer.events" },
    ],
  },
  help: {
    header: "footer.help",
    links: [
      {
        url: "https://www.europeana.eu/rights",
        text: "footer.terms",
        external: true,
      },
      {
        url: "https://www.europeana.eu/privacy-statement",
        text: "footer.privacy",
        external: true,
      },
      {
        url: "https://www.europeana.eu/rights/accessibility-policy",
        text: "footer.accessibility",
        external: true,
      },
      {
        url: "https://www.europeana.eu/rights/cookies-policy",
        text: "footer.cookies",
        external: true,
      },
    ],
  },
  language: {
    header: "footer.language",
    links: [
      {
        url: "https://commission.europa.eu/resources/etranslation_en",
        text: "footer.translationInfo",
        external: true,
      },
    ],
  },
  supportingPartners: {
    header: "footer.supportingPartners",
    links: [
      {
        url: "https://www.contentful.com",
        text: "footer.partners.contentful",
        external: true,
        image: contentfulLogoSrc,
      },
      {
        url: "https://lokalise.com",
        text: "footer.partners.lokalise",
        external: true,
        image: lokaliseLogoSrc,
      },
      {
        url: "https://www.cloudflare.com/galileo/",
        text: "footer.partners.cloudflare",
        external: true,
        image: galileoLogoSrc,
      },
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
      <h3>
        {{ $t(sections.mission.header) }}
      </h3>
      <span>
        {{ $t(sections.mission.text) }}
      </span>
    </div>
    <div class="footer-section">
      <h3>
        {{ $t(sections.info.header) }}
      </h3>
      <ul>
        <li
          v-for="(link, index) in sections.info.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink
            class="nav-link label-uppercase"
            :to="localePath(link.url)"
            :external="link.external"
          >
            {{ $t(link.text) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <h3>
        {{ $t(sections.help.header) }}
      </h3>
      <ul>
        <li
          v-for="(link, index) in sections.help.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink
            class="nav-link label-uppercase"
            :to="localePath(link.url)"
            :external="link.external"
          >
            {{ $t(link.text) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <h3>
        {{ $t(sections.language.header) }}
      </h3>
      <!-- TODO: add language selector -->
      <span>
        <!-- TODO: add translation icon -->
        <NuxtLink
          class="nav-link label-uppercase"
          :to="localePath(sections.language.links[0].url)"
          :external="sections.language.links[0].external"
        >
          {{ $t(sections.language.links[0].text) }}
        </NuxtLink>
      </span>
    </div>
    <div class="footer-section">
      <h3>
        {{ $t(sections.supportingPartners.header) }}
      </h3>
      <ul>
        <li
          v-for="(link, index) in sections.supportingPartners.links"
          :key="index"
          class="footer-link"
        >
          <NuxtLink
            class="nav-link label-uppercase"
            :to="localePath(link.url)"
            :external="link.external"
          >
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
  background-color: $black;
  color: $white;

  @media (min-width: $bp-medium) {
  }

  @media (min-width: $bp-4k) {
  }
}
</style>
