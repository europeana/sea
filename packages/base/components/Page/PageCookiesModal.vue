<script setup>
import useConsentManager from "@europeana/sea-base-layer/composables/consentManager";
import {
  allServicesNames,
  essentialServicesNames,
} from "@/utils/services/services";

const { acceptAll, acceptOnly, rejectAll, consentRequired } = useConsentManager(
  essentialServicesNames,
  allServicesNames,
);

const emit = defineEmits(["showToast"]);

defineProps({
  modalId: {
    type: String,
    default: "cookie-modal",
  },
  modalTitlePath: {
    type: String,
    default: "cookies.consentModal.title",
  },
  modalDescriptionPath: {
    type: String,
    default: "cookies.consentModal.text",
  },
});

const modalRef = useTemplateRef("modal");

onMounted(() => {
  // Listen to modal hide event
  modalRef.value?.addEventListener("hide.bs.modal", () => {
    if (consentRequired.value) {
      emit("showToast");
      selectedServices.value = [];
    }
  });
});

const selectedServices = ref([]);

const accept = () => {
  acceptAll();
};

const decline = () => {
  rejectAll();
};

const save = () => {
  acceptOnly(selectedServices.value);
};
</script>

<template>
  <!-- Teleport to prevent being rendered inside toaster (fixed element) -->
  <Teleport to="#teleports">
    <div :id="modalId" ref="modal" class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header d-block">
            <h2 class="modal-title">{{ $t(modalTitlePath) }}</h2>
          </div>
          <div class="modal-body">
            <i18n-t
              v-if="modalDescriptionPath"
              :keypath="modalDescriptionPath"
              tag="p"
              scope="global"
            >
              <template #privacyPolicy>
                <GenericSmartLink
                  destination="https://www.europeana.eu/rights/privacy-statement"
                >
                  {{ $t("cookies.consentModal.privacyPolicy")
                  }}<!-- This comment removes white space
              -->
                </GenericSmartLink>
              </template>
            </i18n-t>
            <!-- TODO move PageCookiesSection and buttons up as slots to access consent manager in PageCookiesWidget -->
            <!-- <PageCookiesSection
            v-for="(section, index) in groupedSections"
            :key="index"
            :checked-services="checkedServices"
            :service-data="section"
            :show="show"
            @toggle="toggleDisplay"
            @update="updateConsent"
          /> -->
            <div
              class="d-flex flex-wrap justify-content-between align-items-center"
            >
              <button
                class="btn btn-outline-primary mt-2"
                data-bs-dismiss="modal"
                @click="decline"
              >
                {{ $t("cookies.decline") }}
              </button>
              <button
                class="btn btn-outline-primary mt-2 ms-auto me-2"
                data-bs-dismiss="modal"
                @click="save"
              >
                {{ $t("cookies.acceptSelected") }}
              </button>
              <button
                class="btn btn-success mt-2"
                data-bs-dismiss="modal"
                @click="accept"
              >
                {{ $t("cookies.acceptAll") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
