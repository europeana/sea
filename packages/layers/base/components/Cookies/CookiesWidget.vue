<script setup>
import { useConsentManager } from "~/composables/consentManager";

const { t } = useI18n({ useScope: "global" });
const { $bs } = useNuxtApp();
const { acceptAll, rejectAll, consentRequired, consentSaved } =
  useConsentManager();

const toastId = "cookie-notice-toast";
const toastRef = useTemplateRef("toast");
let toastInstance;
const renderModal = ref(false);

const text = computed(() =>
  consentSaved.value
    ? t("cookies.consentNotice.textUpdated")
    : t("cookies.consentNotice.text"),
);

onMounted(async () => {
  if (consentRequired.value) {
    // Initialise Bootstrap Toast
    toastInstance = new $bs.Toast(toastRef.value);
    toastInstance?.show();
  }
});

const acceptAndHide = () => {
  acceptAll();
  toastInstance?.hide();
};

const declineAndHide = () => {
  rejectAll();
  toastInstance?.hide();
};

const openCookieModal = () => {
  renderModal.value = true;
  toastInstance?.hide();
};

const closeModalAndShowToast = () => {
  renderModal.value = false;

  // Show toast when modal closed and no consent preferences are saved (click on backdrop or escape)
  if (consentRequired.value) {
    toastInstance?.show();
  }
};
</script>

<template>
  <div v-if="consentRequired">
    <div
      :id="toastId"
      ref="toast"
      class="toast bg-white border-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-bs-autohide="false"
    >
      <div class="toast-body pb-1 pb-4k-3">
        <p>{{ text }}</p>
        <div
          class="d-flex flex-wrap justify-content-between align-items-center"
        >
          <button
            class="btn btn-link p-0 mb-2 mb-4k-3 me-2 me-4k-3"
            data-bs-target="#cookie-modal"
            @click="openCookieModal"
          >
            {{ $t("cookies.consentNotice.learnMore") }}
          </button>
          <div
            class="d-flex flex-wrap justify-content-end align-items-center ms-auto"
          >
            <button
              class="btn btn-outline-primary ms-auto mb-2 mb-4k-3"
              @click="declineAndHide"
            >
              {{ $t("cookies.decline") }}
            </button>
            <button
              class="btn btn-success ms-2 ms-4k-3 mb-2 mb-4k-3"
              @click="acceptAndHide"
            >
              {{ $t("cookies.acceptAll") }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <LazyCookiesModal
      v-if="renderModal"
      @close-modal="closeModalAndShowToast"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.toast {
  max-width: calc(100vw - 1rem);
  width: 25rem;

  @media (min-width: $bp-4k) {
    width: calc(var(--bp-4k-increment) * 25rem);
  }
}
</style>
