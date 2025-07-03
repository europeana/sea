<script setup>
import contentfulLogoSrc from "@europeana/style/img/supporting-technical-partners/Contentful-logo.svg";
import lokaliseLogoSrc from "@europeana/style/img/supporting-technical-partners/Lokalise-logo.svg";
import galileoLogoSrc from "@europeana/style/img/supporting-technical-partners/Galileo-logo.webp";
import disclaimerLogoSrc from "@europeana/style/img/eu-funded/en-Funded by the EU_NEG.svg";

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
  <footer class="bg-dark text-white px-4 py-5" role="contentinfo">
    <div class="container py-lg-5">
      <h2 class="visually-hidden">
        {{ $t("footer.footer") }}
      </h2>
      <!-- TODO: make "footer-section" a distinct component? -->
      <div class="d-lg-flex justify-content-between">
        <div class="footer-section col col-lg-5 col-xxl-4 me-lg-4 pe-lg-5">
          <h3 class="label-uppercase">
            {{ $t(sections.mission.header) }}
          </h3>
          <p class="fst-italic mb-0">
            {{ $t(sections.mission.text) }}
          </p>
        </div>
        <hr class="d-lg-none opacity-100 text-light" />
        <div class="row">
          <div class="footer-section col col-sm-6 col-wqhd-4">
            <h3 class="label-uppercase">
              {{ $t(sections.info.header) }}
            </h3>
            <ul>
              <li v-for="(link, index) in sections.info.links" :key="index">
                <GenericSmartLink class="nav-link" :destination="link.url">
                  {{ $t(link.text) }}
                </GenericSmartLink>
              </li>
            </ul>
          </div>
          <div
            class="footer-section col col-sm-6 col-wqhd-4 order-sm-3 order-wqhd-2"
          >
            <h3 class="label-uppercase">
              {{ $t(sections.help.header) }}
            </h3>
            <ul>
              <li v-for="(link, index) in sections.help.links" :key="index">
                <GenericSmartLink class="nav-link" :destination="link.url">
                  {{ $t(link.text) }}
                </GenericSmartLink>
              </li>
            </ul>
          </div>
          <div
            class="footer-section col col-sm-6 col-wqhd-4 order-sm-2 order-wqhd-3"
          >
            <h3 class="label-uppercase">
              {{ $t(sections.language.header) }}
            </h3>
            <GenericLanguageSelector />
            <span>
              <!-- TODO: add translation icon -->
              <GenericSmartLink
                class="nav-link"
                :destination="sections.language.links[0].url"
                :hide-external-icon="true"
              >
                {{ $t(sections.language.links[0].text) }}
              </GenericSmartLink>
            </span>
          </div>
          <div class="footer-section col col-sm-6 col-wqhd-4 order-sm-4">
            <h3 class="label-uppercase mb-3 mb-4k-4">
              {{ $t(sections.supportingPartners.header) }}
            </h3>
            <ul class="mb-0 d-wqhd-flex align-items-center">
              <li
                v-for="(link, index) in sections.supportingPartners.links"
                :key="index"
                class="tech-partner mb-2"
              >
                <GenericSmartLink
                  class="nav-link m-wqhd-3"
                  :destination="link.url"
                  :hide-external-icon="true"
                >
                  <img :src="link.image" :alt="$t(link.text)" />
                </GenericSmartLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="footer-section col col-lg-6">
          <ImageEULogo />
        </div>
      </div>
    </div>
  </footer>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

footer {
  @media (min-width: $bp-4k) {
    font-size: $font-size-32;
  }
}

hr {
  margin-top: 2rem;
  margin-bottom: 2rem;

  @media (min-width: $bp-4k) {
    margin-top: 4rem;
    margin-bottom: 4rem;
  }
}

.footer-section {
  h3.label-uppercase {
    font-size: $font-size-14;

    @media (min-width: $bp-4k) {
      font-size: $font-size-28;
      margin-bottom: 1rem;
    }
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 2rem;

    @media (min-width: $bp-4k) {
      margin-bottom: 4rem;
    }
  }
}

.tech-partner img {
  width: 100px;
  mix-blend-mode: lighten;

  @media (min-width: $bp-4k) {
    width: 200px;
  }
}
</style>
