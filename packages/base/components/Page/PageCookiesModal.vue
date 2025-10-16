<script setup>
import useConsentManager from "@europeana/sea-base-layer/composables/consentManager";
import {
  allServicesNames,
  essentialServicesNames,
  services,
} from "@/utils/services/services";

const { acceptAll, acceptOnly, checkedServices, rejectAll, consentRequired } =
  useConsentManager(essentialServicesNames, allServicesNames);

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
    }
  });
});

const show = ref(["thirdPartyContent"]);

const essentialServices = services?.filter((s) =>
  s.purposes.includes("essential"),
);

const usageServices = services?.filter((s) => s.purposes.includes("usage"));

const thirdPartyContentServices = services?.filter((s) =>
  s.purposes.includes("thirdPartyContent"),
);

const groupedSections = [
  // to create layout
  essentialServices?.length && {
    name: "essential",
    required: true,
    services: essentialServices,
  },
  usageServices?.length && {
    name: "usage",
    services: usageServices,
  },
  thirdPartyContentServices?.length && {
    name: "thirdPartyContent",
    services: [
      thirdPartyContentServices.filter((service) =>
        service.purposes?.includes("socialMedia"),
      )?.length && {
        name: "socialMedia",
        services: thirdPartyContentServices.filter((service) =>
          service.purposes?.includes("socialMedia"),
        ),
      },
      thirdPartyContentServices.filter((service) =>
        service.purposes?.includes("mediaViewing"),
      )?.length && {
        name: "mediaViewing",
        services: [
          {
            name: "2D",
            services: thirdPartyContentServices.filter((service) =>
              service.purposes?.includes("2D"),
            ),
          },
          {
            name: "3D",
            services: thirdPartyContentServices.filter((service) =>
              service.purposes?.includes("3D"),
            ),
          },
          {
            name: "audio",
            services: thirdPartyContentServices.filter((service) =>
              service.purposes?.includes("audio"),
            ),
          },
          thirdPartyContentServices.filter((service) =>
            service.purposes?.includes("multimedia"),
          )?.length && {
            name: "multimedia",
            services: thirdPartyContentServices.filter((service) =>
              service.purposes?.includes("multimedia"),
            ),
          },
          {
            name: "video",
            services: thirdPartyContentServices.filter((service) =>
              service.purposes?.includes("video"),
            ),
          },
        ].filter(Boolean),
      },
      thirdPartyContentServices.filter((service) =>
        service.purposes?.includes("other"),
      )?.length && {
        name: "other",
        services: thirdPartyContentServices.filter((service) =>
          service.purposes?.includes("other"),
        ),
      },
    ].filter(Boolean),
  },
].filter(Boolean);

const accept = () => {
  acceptAll();
};

const decline = () => {
  rejectAll();
};

const save = () => {
  acceptOnly(checkedServices.value);
};

const toggleDisplay = (name) => {
  if (show.value.includes(name)) {
    show.value = show.value.filter((purpose) => purpose !== name);
  } else {
    show.value.push(name);
  }
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
              class="mb-4k-4"
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
            <PageCookiesSection
              v-for="(section, index) in groupedSections"
              :key="index"
              :service-data="section"
              :show="show"
              @toggle="toggleDisplay"
            />
            <div
              class="d-flex flex-wrap justify-content-between align-items-center"
            >
              <button
                class="btn btn-outline-primary mt-2 me-2"
                data-bs-dismiss="modal"
                @click="decline"
              >
                {{ $t("cookies.decline") }}
              </button>
              <button
                class="btn btn-outline-primary mt-2 ms-sm-auto me-2"
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
