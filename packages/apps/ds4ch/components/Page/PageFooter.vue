<script setup>
import contentfulLogoSrc from "@europeana/style/img/supporting-technical-partners/Contentful-logo.svg";
import lokaliseLogoSrc from "@europeana/style/img/supporting-technical-partners/Lokalise-logo.svg";
import galileoLogoSrc from "@europeana/style/img/supporting-technical-partners/Galileo-logo.webp";
import disclaimerLogoSrc from "@europeana/style/img/eu-funded/en-Funded by the EU_NEG.svg";
import SmartLink from "../Generic/SmartLink.vue";

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
      },
      {
        url: "https://www.europeana.eu/privacy-statement",
        text: "footer.privacy",
      },
      {
        url: "https://www.europeana.eu/rights/accessibility-policy",
        text: "footer.accessibility",
      },
      {
        url: "https://www.europeana.eu/rights/cookies-policy",
        text: "footer.cookies",
      },
    ],
  },
  language: {
    header: "footer.language",
    links: [
      {
        url: "https://commission.europa.eu/resources/etranslation_en",
        text: "footer.translationInfo",
      },
    ],
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
      {
        url: "https://www.cloudflare.com/galileo/",
        text: "footer.partners.cloudflare",
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
    <h2 class="visually-hidden">
      {{ $t("footer.footer") }}
    </h2>
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
          <SmartLink class="nav-link label-uppercase" :destination="link.url">
            {{ $t(link.text) }}
          </SmartLink>
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
          <SmartLink class="nav-link label-uppercase" :destination="link.url">
            {{ $t(link.text) }}
          </SmartLink>
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
        <SmartLink
          class="nav-link label-uppercase"
          :destination="sections.language.links[0].url"
          :hide-external-icon="true"
        >
          {{ $t(sections.language.links[0].text) }}
        </SmartLink>
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
          <SmartLink
            class="nav-link label-uppercase"
            :destination="link.url"
            :hide-external-icon="true"
          >
            <img :src="link.image" :alt="$t(link.text)" />
          </SmartLink>
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
