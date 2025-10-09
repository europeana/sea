<script setup>
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
  // TODO: invert this to a whitelist, named `showPurposes`
  hidePurposes: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div
    :id="modalId"
    class="modal cookie-modal"
    size="xl"
    hide-footer
    hide-header-close
    :title="$t(modalTitlePath)"
    title-tag="h2"
    header-tag="div"
    @hide="onModalHide"
    @show="setCheckedServices"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header d-block">
          <h2 class="modal-title">{{ $t(modalTitlePath) }}</h2>
        </div>
        <div class="modal-body">
          <i18n
            v-if="modalDescriptionPath"
            :path="modalDescriptionPath"
            tag="p"
          >
            <template #privacyPolicy>
              <SmartLink
                destination="https://www.europeana.eu/rights/privacy-statement"
              >
                {{ $t("cookies.consentModal.privacyPolicy")
                }}<!-- This comment removes white space
              -->
              </SmartLink>
            </template>
          </i18n>
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
            <button class="btn btn-outline-primary mt-2" @click="rejectAll">
              {{ $t("cookies.decline") }}
            </button>
            <button
              class="btn btn-outline-primary mt-2 ms-auto me-2"
              @click="saveAndHide"
            >
              {{ $t("cookies.acceptSelected") }}
            </button>
            <button class="btn btn-success mt-2" @click="acceptAndHide">
              {{ $t("cookies.acceptAll") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
