<script setup>
import { useConsentManager } from "@europeana/sea-base-layer/composables/consentManager";

const { acceptAll, rejectAll, consentRequired } = useConsentManager();

const toastId = "cookie-notice-toast";
const toastRef = useTemplateRef("toast");
let toastInstance;

onMounted(async () => {
  if (consentRequired.value) {
    // Initialise Bootstrap Toast
    const { Toast } = await import("bootstrap");
    toastInstance = new Toast(toastRef.value);
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
  toastInstance?.hide();
};

const showToast = () => {
  toastInstance?.show();
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
      <div class="toast-body">
        <p>{{ $t("cookies.consentNotice.description") }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <button
            class="btn btn-link p-0"
            data-bs-toggle="modal"
            data-bs-target="#cookie-modal"
            @click="openCookieModal"
          >
            {{ $t("cookies.consentNotice.learnMore") }}
          </button>
          <button
            class="btn btn-outline-primary ms-auto me-2 me-4k-3"
            @click="declineAndHide"
          >
            {{ $t("cookies.decline") }}
          </button>
          <button class="btn btn-success" @click="acceptAndHide">
            {{ $t("cookies.ok") }}
          </button>
        </div>
      </div>
    </div>
    <CookiesModal @show-toast="showToast" />
  </div>
</template>
