<script setup>
import { useConsentManager } from "@europeana/sea-base-layer/composables/consentManager";
import { services } from "@/utils/services/services";
import serviceForUrl from "@/utils/services/index.js";

const { acceptedServices, acceptOnly, checkedServices, consentRequired } =
  useConsentManager();

const { t, te } = useI18n({ useScope: "global" });

const props = defineProps({
  embedCode: {
    type: String,
    default: null,
  },
});

const cookieModalId = "embed-cookie-modal";
const renderModal = ref(false);
const iframe = ref({});
const opened = ref(false);
const script = ref({});

const linkToContent = computed(() => iframe.value?.src);
const providerUrl = computed(() => iframe.value.src || script.value.src);
const provider = computed(() =>
  providerUrl.value ? serviceForUrl(providerUrl.value) : null,
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
const modalProps = computed(() => {
  if (consentRequired.value) {
    return {
      scrollTo: `#${cookieModalId}-consentcheckbox-thirdPartyContent`,
    };
  } else {
    return {
      displayPurposes: ["thirdPartyContent"],
      modalTitlePath: "cookies.purposes.thirdPartyContent.title",
      modalDescriptionPath: null,
    };
  }
});

// TODO: is this still needed if already watching acceptedServices?
watch(consentRequired, (newVal) => {
  if (!newVal) {
    checkConsentAndOpenEmbed();
  }
});
// Watch when accepted from the embed-cookie-modal
watch(acceptedServices, () => {
  checkConsentAndOpenEmbed();
});

onBeforeMount(() => {
  parseEmbedCode();
  checkConsentAndOpenEmbed();
});

const openModal = () => {
  renderModal.value = true;
};

const elementStyleDimension = (element, dimension) => {
  if (element.style[dimension]) {
    return element.style[dimension];
  }
  if (element[dimension] && !isNaN(element[dimension])) {
    return `${element[dimension]}px`;
  }
  return element[dimension];
};

const elementStyleDimensions = (element) => ({
  width: elementStyleDimension(element, "width"),
  height: elementStyleDimension(element, "height"),
});

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
      ...elementStyleDimensions(iframeEl),
      src: iframeEl.src,
    };
  } else if (scriptEl) {
    script.value = { src: scriptEl.src };
  }
};

const checkConsentAndOpenEmbed = () => {
  const consents = acceptedServices.value;
  const providerHasConsent = !!consents?.includes(provider.value?.name);

  // open the gate when  provider has consent or there is no iframe/script embed, but other code
  // rendered such as audio, video or plain HTML
  if (providerHasConsent || (!iframe.value.src && !script.value.src)) {
    opened.value = true;
  }
};

const consentAllEmbeddedContent = async () => {
  if (consentRequired.value) {
    openModal();
    // wait for modal to be shown and checkedServices reset before adding all third party services to checkedServices
    await nextTick();
  }

  const allThirdPartyContentServices = services
    .filter((s) => s.purposes.includes("thirdPartyContent"))
    .flat()
    .map((service) => service.name);
  checkedServices.value = [...checkedServices.value].concat(
    allThirdPartyContentServices,
  );

  if (!consentRequired.value) {
    saveConsents();
  }
};

const consentThisProvider = async () => {
  if (consentRequired.value) {
    openModal();
    // wait for modal to be shown and checkedServices reset before adding current provider to checkedServices
    await nextTick();
  }

  checkedServices.value = [...checkedServices.value, provider.value.name];

  if (!consentRequired.value) {
    saveConsents();
  }
};

const saveConsents = () => {
  acceptOnly([...checkedServices.value]);
  checkConsentAndOpenEmbed();
};

const closeModal = () => {
  renderModal.value = false;
};
</script>

<template>
  <client-only>
    <div class="h-100">
      <slot v-if="opened" class="embed-gateway-opened" />
      <div
        v-else-if="provider"
        class="container notification-overlay"
        :class="{ 'mw-100': embedCode }"
      >
        <div class="row position-relative">
          <div class="col thumbnail-background mx-auto h-100 position-absolute">
            <!-- Add MediaCard when used for items -->
            <div
              class="icon-multimedia h-100 d-flex align-items-center justify-content-center"
            />
          </div>
          <div
            class="col notification-content mx-auto position-relative"
            :style="{
              'min-height': !!iframe.height && iframe.height,
              width: !!iframe.width && iframe.width,
            }"
          >
            <p class="message">
              {{ $t("embedNotification.message", { provider: providerName }) }}
            </p>
            <button
              class="accept-all-button btn btn-light mb-2"
              :data-bs-target="`#${cookieModalId}`"
              @click="consentAllEmbeddedContent"
            >
              {{ $t("embedNotification.loadAllEmbeddedContent") }}
            </button>
            <i18n-t
              keypath="embedNotification.ofThirdPartyServices"
              tag="p"
              scope="global"
            >
              <button
                class="btn btn-link"
                :data-bs-target="`#${cookieModalId}`"
                @click="openModal"
              >
                {{ $t("embedNotification.viewFullList") }}
              </button>
            </i18n-t>
            <LazyCookiesModal
              v-if="renderModal"
              :modal-id="cookieModalId"
              v-bind="modalProps"
              @close-modal="closeModal"
            />
            <i18n-t keypath="embedNotification.ifNotAll" tag="p" scope="global">
              <button
                class="accept-only-button btn btn-link"
                :data-bs-target="`#${cookieModalId}`"
                @click="consentThisProvider"
              >
                {{ $t("embedNotification.loadOnlyThis") }}
              </button>
            </i18n-t>
          </div>
        </div>
      </div>
      <div v-else class="container">
        <div class="row">
          <div class="col unsupported-content-notification mx-auto">
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
  </client-only>
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

  @at-root .landing-page.xxl-page & .btn-link,
    .btn-link {
    color: $white;
    display: inline;
    font-size: $font-size-extrasmall;
    padding: 0;
    text-decoration-line: underline;
    vertical-align: baseline;

    &:hover,
    &:active,
    &:focus {
      color: $white;
    }
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

  :deep(img) {
    height: 100%;
    object-fit: cover;
  }

  :deep(.default-thumbnail) {
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

    :deep(.icon-external-link) {
      vertical-align: baseline;
    }
  }
}
</style>
