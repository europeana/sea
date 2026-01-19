<script setup>
import { useConsentManager } from "~/composables/consentManager";

const { acceptedServices } = useConsentManager();

const checkedServices = defineModel({
  type: Array,
  default: null,
});

if (!checkedServices.value) {
  checkedServices.value = [...acceptedServices.value];
}

const { t, te, fallbackLocale } = useI18n({ useScope: "global" });

const emit = defineEmits(["toggle"]);

const props = defineProps({
  depth: {
    type: Number,
    default: 1,
  },
  modalId: {
    type: String,
    default: null,
  },
  serviceData: {
    type: Object,
    default: () => {},
  },
  show: {
    type: Array,
    default: () => [],
  },
});

const COLLAPSIBLE_DEPTH_LIMIT = 2;

const label = computed(() => {
  if (props.serviceData.services) {
    return t(`cookies.purposes.${props.serviceData.name}.title`);
  } else if (te(`cookies.services.${props.serviceData.name}.title`)) {
    return t(`cookies.services.${props.serviceData.name}.title`);
  } else {
    return props.serviceData.title;
  }
});
const description = computed(() => {
  let key;
  if (props.serviceData.services) {
    key = `cookies.purposes.${props.serviceData.name}.description`;
  } else {
    key = `cookies.services.${props.serviceData.name}.description`;
  }
  if (te(key, fallbackLocale)) {
    return t(key);
  }
  return undefined;
});
const indeterminate = computed(() => {
  if (props.serviceData.services) {
    return !allChildServicesChecked.value && !noChildServicesChecked.value;
  }
  return false;
});
const flattenedServiceNames = computed(() => {
  const childServices = (service) => {
    return service.services
      ? service.services.map(childServices).flat()
      : [service];
  };
  return childServices(props.serviceData).map((service) => service.name);
});
const allChildServicesChecked = computed(() => {
  if (props.serviceData.services) {
    return flattenedServiceNames.value.every((service) =>
      checkedServices.value.includes(service),
    );
  } else {
    return false;
  }
});
const noChildServicesChecked = computed(() => {
  if (props.serviceData.services) {
    return !flattenedServiceNames.value.some((service) =>
      checkedServices.value.includes(service),
    );
  } else {
    return false;
  }
});
const servicesCount = computed(() => {
  return flattenedServiceNames.value.length;
});
const showNestedServices = computed(() => {
  return props.show.includes(props.serviceData.name);
});

const updateConsent = (value) => {
  if (value) {
    checkedServices.value = checkedServices.value.concat(
      flattenedServiceNames.value.filter(
        (service) => !checkedServices.value.includes(service),
      ),
    );
  } else {
    checkedServices.value = checkedServices.value.filter(
      (name) => !flattenedServiceNames.value.includes(name),
    );
  }
};

const toggleDisplay = (name) => {
  emit("toggle", name);
};

const renderServiceAsCheckbox = (
  service = props.serviceData,
  depth = props.depth,
) => {
  return service.services ? depth <= COLLAPSIBLE_DEPTH_LIMIT : true;
};

const checked = ref(false);
watchEffect(() => {
  checked.value =
    props.serviceData.required ||
    allChildServicesChecked.value ||
    checkedServices.value.includes(props.serviceData.name)
      ? true
      : false;
});
</script>

<template>
  <component
    :is="renderServiceAsCheckbox() ? 'div' : 'fieldset'"
    class="consent-checkbox-section"
  >
    <legend
      v-if="!renderServiceAsCheckbox()"
      class="legend mb-0 fw-bold text-uppercase"
    >
      {{ label }}
      <span v-if="serviceData.required">{{
        $t("cookies.consentModal.alwaysRequired")
      }}</span>
    </legend>
    <div v-else class="form-check form-switch">
      <input
        :id="`${modalId}-consentcheckbox-${serviceData.name}`"
        v-model="checked"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :name="serviceData.name"
        switch
        :disabled="serviceData.required"
        :indeterminate="indeterminate"
        :class="{ secondary: !serviceData.services, active: indeterminate }"
        :aria-describedby="
          description &&
          `${modalId}-consentcheckbox-description-${serviceData.name}`
        "
        :aria-checked="indeterminate && 'mixed'"
        @change="(event) => updateConsent(event.target.checked)"
      />
      <label
        class="form-check-label"
        :class="{ secondary: !serviceData.services }"
        :for="`${modalId}-consentcheckbox-${serviceData.name}`"
      >
        {{ label }}
        <span v-if="serviceData.required"
          >{{ $t("cookies.consentModal.alwaysRequired") }}
        </span>
      </label>
    </div>
    <p
      v-if="description"
      :id="`${modalId}-consentcheckbox-description-${serviceData.name}`"
      class="description mb-0"
    >
      {{ description }}
    </p>
    <template v-if="serviceData.services">
      <button
        v-if="depth <= COLLAPSIBLE_DEPTH_LIMIT"
        class="btn btn-link"
        :class="{ show: showNestedServices }"
        :aria-controls="`${modalId}-consentcheckbox-subsection-${serviceData.name}`"
        :aria-expanded="showNestedServices ? 'true' : 'false'"
        @click="toggleDisplay(serviceData.name)"
      >
        {{
          $t("cookies.consentModal.servicesCount", servicesCount, {
            count: $n(servicesCount),
          })
        }}
        <span class="icon-chevron ms-1" />
      </button>
      <div
        v-show="
          depth > COLLAPSIBLE_DEPTH_LIMIT || show.includes(serviceData.name)
        "
        :id="`${modalId}-consentcheckbox-subsection-${serviceData.name}`"
      >
        <CookiesSection
          v-for="(subService, subServiceIndex) in serviceData.services"
          :key="subServiceIndex"
          v-model="checkedServices"
          class="nested-section"
          :class="{ 'ps-0': depth > COLLAPSIBLE_DEPTH_LIMIT }"
          :depth="depth + 1"
          :service-data="subService"
          :show="show"
          @toggle="toggleDisplay"
        />
      </div>
    </template>
  </component>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.consent-checkbox-section {
  p,
  .btn {
    padding-left: 2rem;
  }

  .nested-section {
    padding-left: 2rem;

    &:last-child {
      margin-bottom: 0.5rem;
    }
  }

  .legend {
    color: $darkgrey;
  }

  .btn-link {
    margin-bottom: 1rem;

    .icon-chevron {
      display: inline-block;
    }

    &.show {
      margin-bottom: 0.25rem;

      .icon-chevron {
        transform: rotateX(180deg);
      }
    }
  }

  .form-check-label {
    opacity: 1;
    font-weight: 600;

    &.secondary {
      color: $darkgrey;
      font-weight: 400;
    }

    span {
      color: $darkgrey-light;
      text-transform: lowercase;
    }
  }
}
</style>
