<script setup>
import { useConsentManager } from "@europeana/sea-base-layer/composables/consentManager";
import { services } from "@/utils/services/services";
import useScrollTo from "@/composables/scrollTo.js";

const {
  acceptAll,
  acceptOnly,
  acceptedServices,
  checkedServices,
  rejectAll,
  consentRequired,
} = useConsentManager();

const { scrollToSelector } = useScrollTo();

const emit = defineEmits(["showToast"]);

const props = defineProps({
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
  displayPurposes: {
    type: Array,
    default: () => ["essential", "usage", "thirdPartyContent"],
  },
  scrollTo: {
    type: String,
    default: null,
  },
});

const modalRef = useTemplateRef("modal");

onMounted(() => {
  modalRef.value?.addEventListener("show.bs.modal", () => {
    if (props.scrollTo) {
      listenToModalTransitionendAndScrollToSection();
    }

    // Reset checked services to saved services
    checkedServices.value = [...acceptedServices.value];
  });

  // Show toast when modal closed and no consent preferences are saved (click on backdrop or escape)
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

const groupedSections = computed(() =>
  [
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
  ]
    .filter(Boolean)
    .filter((purpose) => props.displayPurposes.includes(purpose.name)),
);

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

const listenToModalTransitionendAndScrollToSection = () => {
  const modalContainer = modalRef.value;
  const sectionId = props.scrollTo;

  // This overrides the BV modal component setting focus which might happen asynchronously and mess with the scroll effect
  modalContainer.focus();
  modalContainer.addEventListener(
    "transitionend",
    () => {
      scrollToSection(modalContainer, sectionId);
    },
    { once: true },
  );
};

const scrollToSection = (modalContainer, sectionId) => {
  scrollToSelector(sectionId, {
    behavior: "smooth",
    container: modalContainer,
  });
};
</script>

<template>
  <!-- Teleport to prevent being rendered inside toaster (fixed element) -->
  <Teleport to="body">
    <div
      :id="modalId"
      ref="modal"
      class="modal fade"
      tabindex="-1"
      :aria-labelledby="`${modalId}-title`"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header d-block">
            <h2 :id="`${modalId}-title`" class="modal-title">
              {{ $t(modalTitlePath) }}
            </h2>
          </div>
          <div class="modal-body">
            <i18n-t
              v-if="modalDescriptionPath"
              :keypath="modalDescriptionPath"
              tag="p"
              scope="global"
              class="mb-4k-4"
            >
              <template #privacyStatement>
                <GenericSmartLink
                  destination="https://www.europeana.eu/rights/privacy-statement"
                >
                  {{ $t("cookies.consentModal.privacyStatement")
                  }}<!-- This comment removes white space
              -->
                </GenericSmartLink>
              </template>
            </i18n-t>
            <CookiesSection
              v-for="(section, index) in groupedSections"
              :key="index"
              :modal-id="modalId"
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
