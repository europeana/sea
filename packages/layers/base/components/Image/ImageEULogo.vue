<script setup>
import { useI18n } from "vue-i18n";
// TODO: consider moving the logos out of the style package and into the base layer to enable use of dynamic imports.
import bgLogo from "@europeana/style/img/eu-funded/bg-Funded by the EU_NEG.svg";
import csLogo from "@europeana/style/img/eu-funded/cs-Funded by the EU_NEG.svg";
import daLogo from "@europeana/style/img/eu-funded/da-Funded by the EU_NEG.svg";
import deLogo from "@europeana/style/img/eu-funded/de-Funded by the EU_NEG.svg";
import elLogo from "@europeana/style/img/eu-funded/el-Funded by the EU_NEG.svg";
import enLogo from "@europeana/style/img/eu-funded/en-Funded by the EU_NEG.svg";
import esLogo from "@europeana/style/img/eu-funded/es-Funded by the EU_NEG.svg";
import etLogo from "@europeana/style/img/eu-funded/et-Funded by the EU_NEG.svg";
import fiLogo from "@europeana/style/img/eu-funded/fi-Funded by the EU_NEG.svg";
import frLogo from "@europeana/style/img/eu-funded/fr-Funded by the EU_NEG.svg";
import gaLogo from "@europeana/style/img/eu-funded/ga-Funded by the EU_NEG.svg";
import hrLogo from "@europeana/style/img/eu-funded/hr-Funded by the EU_NEG.svg";
import huLogo from "@europeana/style/img/eu-funded/hu-Funded by the EU_NEG.svg";
import itLogo from "@europeana/style/img/eu-funded/it-Funded by the EU_NEG.svg";
import ltLogo from "@europeana/style/img/eu-funded/lt-Funded by the EU_NEG.svg";
import lvLogo from "@europeana/style/img/eu-funded/lv-Funded by the EU_NEG.svg";
import mtLogo from "@europeana/style/img/eu-funded/mt-Funded by the EU_NEG.svg";
import nlLogo from "@europeana/style/img/eu-funded/nl-Funded by the EU_NEG.svg";
import plLogo from "@europeana/style/img/eu-funded/pl-Funded by the EU_NEG.svg";
import ptLogo from "@europeana/style/img/eu-funded/pt-Funded by the EU_NEG.svg";
import roLogo from "@europeana/style/img/eu-funded/ro-Funded by the EU_NEG.svg";
import skLogo from "@europeana/style/img/eu-funded/sk-Funded by the EU_NEG.svg";
import slLogo from "@europeana/style/img/eu-funded/sl-Funded by the EU_NEG.svg";
import svLogo from "@europeana/style/img/eu-funded/sv-Funded by the EU_NEG.svg";

const logoMap = {
  bg: bgLogo,
  cs: csLogo,
  da: daLogo,
  de: deLogo,
  el: elLogo,
  en: enLogo,
  es: esLogo,
  et: etLogo,
  fi: fiLogo,
  fr: frLogo,
  ga: gaLogo,
  hr: hrLogo,
  hu: huLogo,
  it: itLogo,
  lt: ltLogo,
  lv: lvLogo,
  mt: mtLogo,
  nl: nlLogo,
  pl: plLogo,
  pt: ptLogo,
  ro: roLogo,
  sk: skLogo,
  sl: slLogo,
  sv: svLogo,
};
const { locale } = useI18n();
const localisedEULogo = computed(() => {
  return logoMap[locale.value] || enLogo;
});
</script>
<template>
  <img
    height="73"
    :src="localisedEULogo"
    :alt="$t('footer.imageDescription')"
  />
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

img {
  height: 68px;

  @media (min-width: $bp-small) {
    height: 73px;
  }

  @media (min-width: $bp-4k) {
    height: 146px;
  }
}
</style>
