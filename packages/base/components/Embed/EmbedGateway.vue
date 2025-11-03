<script setup>
import { useConsentManager } from "@europeana/sea-base-layer/composables/consentManager";
import { services } from "@/utils/services/services";
import serviceForUrl from "@/utils/services/index.js";
// import useScrollTo from "@/composables/scrollTo.js";
import { computed } from "vue";

const { acceptedServices, acceptOnly, checkedServices, consentRequired } =
  useConsentManager();
// const { scrollToSelector } = useScrollTo();
const { t, te } = useI18n({ useScope: "global" });

const props = defineProps({
  embedCode: {
    type: String,
    default: null,
  },
  media: {
    type: Object,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
});

const cookieModalId = "embed-cookie-modal";
// const hidePurposes = ["essential", "usage"];
const iframe = ref({});
const opened = ref(false);
const renderCookieModal = ref(false);
const script = ref({});

const linkToContent = computed(() => props.url || iframe.value?.src);
const provider = computed(() =>
  providerUrl.value ? serviceForUrl(providerUrl) : null,
);
const providerName = computed(() => {
  if (provider.value) {
    if (te(`cookies.services.${provider.value.name}.title`)) {
      return t(`cookies.services.${provider.value.name}.title`);
    } else {
      return provider.value.title;
    }
  } else {
    return t("cookies.services.unknownProvider");
  }
});

const providerUrl = computed(
  () => iframe.value.src || script.value.src || props.url,
);

watch(consentRequired.value, (newVal) => {
  if (!newVal) {
    checkConsentAndOpenEmbed();
  }
});
// klaroManager is not available in mounted so watch it to be ready instead
// watch(klaroManager, (newVal) => {
//   if (newVal) {
//     checkConsentAndOpenEmbed();
//   }
// });

onBeforeMount(() => parseEmbedCode());

const parseEmbedCode = () => {
  if (!props.embedCode) {
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(props.embedCode, "text/html");

  const iframeEl = doc.querySelector("iframe");
  const scriptEl = doc.querySelector("script");

  if (iframeEl) {
    iframe.value = {
      height: isNaN(iframeEl.height) ? iframeEl.height : `${iframeEl.height}px`,
      width: isNaN(iframeEl.width) ? iframeEl.width : `${iframeEl.width}px`,
      src: iframeEl.src,
    };
  } else if (scriptEl) {
    script.value = { src: scriptEl.src };
  }

  // open the gate when there is no iframe/script embed, but other code
  // rendered such as audio, video or plain HTML
  opened.value = !iframe.value.src && !script.value.src;
};

const openCookieModal = () => {
  // open modal through data props
  if (consentRequired.value) {
    openMainCookieModalAndScrollToThirdPartyContent();
  } else {
    renderCookieModal.value = true;
    // TODO replace
    // $bvModal.show(cookieModalId);
  }
};

const checkConsentAndOpenEmbed = () => {
  const consents = acceptedServices.value;
  const providerHasConsent = !!consents?.[provider.value?.name];

  if (providerHasConsent) {
    opened.value = true;
  }
};

const consentAllEmbeddedContent = () => {
  if (consentRequired.value) {
    checkedServices.value = services.map((service) => service.name);
  } else {
    const allThirdPartyContentServices = services.filter((s) =>
      s.purposes.includes("thirdPartyContent"),
    );
    checkedServices.value = [
      ...checkedServices.value,
      allThirdPartyContentServices,
    ];
  }

  openModalOrSaveConsents();
};

const consentThisProvider = () => {
  checkedServices.value = [...checkedServices.value, provider.value.name];

  openModalOrSaveConsents();
};

const openModalOrSaveConsents = () => {
  if (consentRequired) {
    openMainCookieModalAndScrollToThirdPartyContent();
  } else {
    acceptOnly([...checkedServices.value]);
    checkConsentAndOpenEmbed();
  }
};

const openMainCookieModalAndScrollToThirdPartyContent = () => {
  // TODO handle scroll in modal component?
  // Listen to modal shown event and then to modal transitionend before attempting to scroll
  // $root.$once("bv::modal::shown", (event, modalId) =>
  //   listenToModalTransitionendAndScrollToSection(event, modalId),
  // );
  // $bvModal.show("cookie-modal");
};

// const listenToModalTransitionendAndScrollToSection = (event, modalId) => {
//   if (modalId === "cookie-modal") {
//     const modalContainer = event.target;
//     const sectionId = "#consentcheckbox-section-thirdPartyContent";

//     // This overrides the BV modal component setting focus which might happen asynchronously and mess with the scroll effect
//     modalContainer.focus();
//     modalContainer.addEventListener(
//       "transitionend",
//       () => scrollToSection(modalContainer, sectionId),
//       { once: true },
//     );
//   }
// };

// const scrollToSection = (modalContainer, sectionId) => {
//   scrollToSelector(sectionId, {
//     behavior: "smooth",
//     container: modalContainer,
//   });
// };
</script>

<template>
  <div class="h-100">
    <slot v-if="opened" class="embed-gateway-opened" />
    <div
      v-else-if="provider"
      class="container notification-overlay"
      :class="{ 'h-100': url, 'mw-100': embedCode }"
    >
      <div class="row position-relative" :class="{ 'h-100': url }">
        <div
          class="col thumbnail-background mx-auto h-100 position-absolute"
          :class="{ 'col-lg-10': url }"
        >
          <!-- Add MediaCard for when used for items -->
          <div
            class="icon-multimedia h-100 d-flex align-items-center justify-content-center"
          />
        </div>
        <div
          class="col notification-content mx-auto position-relative"
          :class="{ 'col-lg-10': url }"
          :style="{
            'min-height': !!iframe.height && iframe.height,
            width: !!iframe.width && iframe.width,
          }"
        >
          <p class="message">
            {{ $t("embedNotification.message", { provider: providerName }) }}
          </p>
          <button class="btn btn-light mb-2" @click="consentAllEmbeddedContent">
            {{ $t("embedNotification.loadAllEmbeddedContent") }}
          </button>
          <i-18n path="embedNotification.ofThirdPartyServices" tag="p">
            <button class="btn btn-link" @click="openCookieModal">
              {{ $t("embedNotification.viewFullList") }}
            </button>
          </i-18n>
          <!-- <PageCookiesWidget
            v-if="renderCookieModal"
            :render-toast="false"
            :modal-id="cookieModalId"
            modal-title-path="klaro.main.purposes.thirdPartyContent.title"
            :modal-description-path="null"
            :hide-purposes="hidePurposes"
            :only-show-if-consent-required="false"
            :show-modal="true"
          /> -->
          <PageCookiesModal
            v-if="renderCookieModal"
            :modal-id="cookieModalId"
          />
          <i-18n path="embedNotification.ifNotAll" tag="p">
            <button class="btn btn-link" @click="consentThisProvider">
              {{ $t("embedNotification.loadOnlyThis") }}
            </button>
          </i-18n>
        </div>
      </div>
    </div>
    <div v-else class="container">
      <div class="row">
        <div
          class="col unsupported-content-notification mx-auto"
          :class="{ 'col-lg-10': url }"
        >
          <p class="mb-0">
            {{ $t("embedNotification.messageUnkownService") }}
          </p>
          <GenericSmartLink v-if="linkToContent" :destination="linkToContent">
            {{ $t("embedNotification.viewThisExternalLink") }}
          </GenericSmartLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.embed-gateway-opened {
  transition: $standard-transition;
}

.notification-overlay {
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    var(--bg-img) center no-repeat;
  background-size: contain;
  color: $white;
  overflow: auto;
  position: relative;

  p {
    font-size: $font-size-extrasmall;
  }

  .message {
    font-weight: 600;
    font-size: $font-size-small;
  }

  .btn-light:not(:hover) {
    color: $darkgrey;
  }

  .btn-link {
    color: $white;
    display: inline;
    font-size: $font-size-extrasmall;
    padding: 0;
    text-decoration-line: underline;
    vertical-align: baseline;
  }
}

.notification-content {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem calc(15px + 1rem);
  overflow: auto;

  @media (min-width: $bp-small) {
    padding: 2rem calc(15px + 2rem);
  }
}

.thumbnail-background {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  ::v-deep img {
    height: 100%;
    object-fit: cover;
  }

  ::v-deep .default-thumbnail {
    background-color: $white !important;
    height: 100%;
    width: 100%;
    border-radius: 0;

    [class^="icon-"],
    [class*=" icon-"] {
      opacity: 1;

      &:before {
        content: "\e96b";
        font-size: 8rem;
        color: $middlegrey;

        @media (min-width: $bp-medium) {
          font-size: 15rem;
        }
      }
    }
  }

  .icon-multimedia {
    background-color: $white;

    &:before {
      font-size: 8rem;
      color: $middlegrey;

      @media (min-width: $bp-medium) {
        font-size: 15rem;
      }
    }
  }
}

.unsupported-content-notification {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 0.25rem;
  color: $white;
  font-size: $font-size-small;
  font-weight: 600;
  padding: 1rem;
  text-align: left;

  @media (min-width: $bp-medium) {
    padding: 1.75rem 2rem;
  }

  a {
    color: $white;

    ::v-deep .icon-external-link {
      vertical-align: baseline;
    }
  }
}
</style>
