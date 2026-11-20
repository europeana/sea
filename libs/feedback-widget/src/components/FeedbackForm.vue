<script setup>
import { computed, inject, ref, nextTick, onMounted } from "vue";
import TextInterpolation from "./TextInterpolation.vue";

import CancelCircleIcon from "@europeana/style/img/icons/cancel_circle.svg";
import CheckCircleIcon from "@europeana/style/img/icons/check_circle.svg";
import ExternalLinkIcon from "@europeana/style/img/icons/external-link.svg";

const config = inject("config");
const i18n = inject("i18n");

const currentStep = ref(1);
const feedbackForm = ref(null);
const email = ref("");
const emailInput = ref(null);
const feedback = ref("");
const feedbackTextarea = ref(null);
const requestSuccess = ref(null);
const sending = ref(false);
const invalid = ref({});

onMounted(() => {
  feedbackTextarea.value.focus();
});

const disableNextButton = computed(
  () => (currentStep.value === 1 && feedback.value === "") || sending.value,
);
const disableSendButton = computed(
  () => (currentStep.value === 2 && email.value === "") || sending.value,
);
const disableSkipButton = computed(() => sending.value);
const showCancelButton = computed(
  () => currentStep.value < 3 || !requestSuccess.value,
);
const showCloseButton = computed(() => !showCancelButton.value);
const showNextButton = computed(() => currentStep.value < 2);
const showSendButton = computed(
  () =>
    currentStep.value === 2 ||
    (currentStep.value === 3 && !requestSuccess.value),
);
const showSkipButton = computed(() => currentStep.value === 2);

const docsUrl = (path) =>
  `https://www.europeana.eu/${i18n.value.locale}${path}`;

const wordLength = (text) => text?.trim()?.match(/\w+/g)?.length || 0;

const goToStep = (step) => (currentStep.value = step);

const handleInputFeedback = () => {
  if (wordLength(feedback.value) < 5) {
    feedbackTextarea.value.setCustomValidity(i18n.value.t("validFeedback"));
  } else {
    feedbackTextarea.value.setCustomValidity("");
  }
};

const postFeedbackMessage = () => {
  const postData = {
    feedback: feedback.value,
    pageUrl: window.location.href,
    browser: navigator.userAgent,
    screensize: `${window.innerWidth} x ${window.innerHeight}`,
  };
  if (email.value && email.value !== "") {
    postData.email = email.value;
  }

  return fetch(config.value.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });
};

const sendFeedback = async () => {
  sending.value = true;

  try {
    const response = await postFeedbackMessage();
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    requestSuccess.value = true;
    if (currentStep.value < 3) {
      goToStep(currentStep.value + 1);
    }
  } catch {
    requestSuccess.value = false;
  } finally {
    sending.value = false;
  }
};

const submitForm = async () => {
  invalid.value = {};
  const valid = feedbackForm.value.checkValidity();

  if (!valid) {
    Array.from(feedbackForm.value.elements)
      .find((el) => !el.valid)
      ?.focus();
    return;
  }

  if (currentStep.value > 1) {
    await sendFeedback();
  }
  if (currentStep.value < 3) {
    goToStep(currentStep.value + 1);

    if (currentStep.value === 2) {
      nextTick(() => {
        emailInput.value.focus();
      });
    }
  }
};

const handleInvalidField = (field) => {
  invalid.value[field] = true;
};

const skipEmail = () => {
  email.value = "";
};
</script>

<template>
  <form
    ref="feedbackForm"
    class="europeana-feedback-form"
    data-qa="feedback widget form"
    novalidate
    @submit.prevent="submitForm"
  >
    <div class="d-flex flex-wrap">
      <div class="form-fields">
        <div v-if="currentStep === 1">
          <label for="efw-feedback-input" class="d-block"
            >{{ i18n.t("feedback") }}
            <span
              v-if="invalid.feedback"
              data-qa="feedback invalid hidden label"
              class="visually-hidden"
            >
              {{ feedbackTextarea.validationMessage }}
            </span>
          </label>
          <textarea
            id="efw-feedback-input"
            ref="feedbackTextarea"
            v-model="feedback"
            data-qa="feedback textarea"
            class="form-control"
            :class="{ 'is-invalid': invalid.feedback }"
            required
            name="feedback"
            rows="5"
            aria-required="true"
            :aria-invalid="invalid.feedback"
            @invalid="handleInvalidField('feedback')"
            @input="handleInputFeedback"
          />
          <div
            v-if="invalid.feedback"
            id="efw-feedback-textarea-error"
            data-qa="feedback invalid text"
            class="invalid-feedback"
          >
            {{ feedbackTextarea.validationMessage }}
          </div>
        </div>
        <div v-if="currentStep === 2">
          <label for="efw-email-input" class="d-block">
            {{ i18n.t("emailAddress") }}
            <span
              v-if="invalid.email"
              data-qa="email invalid hidden label"
              class="visually-hidden"
            >
              {{ emailInput.validationMessage }}
            </span>
          </label>
          <input
            id="efw-email-input"
            ref="emailInput"
            v-model="email"
            data-qa="feedback email"
            class="form-control"
            :class="{ 'is-invalid': invalid.email }"
            autocomplete="email"
            type="email"
            name="email"
            aria-describedby="efw-input-live-feedback"
            :aria-invalid="invalid.email"
            @invalid="handleInvalidField('email')"
          />
          <div
            v-if="invalid.email"
            id="efw-email-input-error"
            data-qa="email invalid text"
            class="invalid-feedback"
          >
            {{ emailInput.validationMessage }}
          </div>
          <div
            id="efw-input-live-feedback"
            class="form-text"
            data-qa="feedback email helptext"
          >
            <p class="mb-0">
              {{ i18n.t("emailOptional") }}
              <TextInterpolation :text="i18n.t('policies')" tag="span">
                <template #termsAndPolicies>
                  <a :href="docsUrl('/rights')" target="_blank">
                    {{ i18n.t("termsAndPolicies") }}
                  </a>
                </template>
                <template #privacyStatement>
                  <a
                    :href="docsUrl('/rights/privacy-statement')"
                    target="_blank"
                  >
                    {{ i18n.t("privacyPolicy") }}
                  </a>
                </template>
              </TextInterpolation>
            </p>
          </div>
        </div>
        <div
          v-if="currentStep == 3"
          data-qa="feedback request status message"
          class="feedback-success d-flex align-items-center mb-3 mb-sm-0"
          role="alert"
          aria-atomic="true"
        >
          <span v-if="requestSuccess" class="d-flex align-items-center">
            <CheckCircleIcon
              class="icon-check-circle"
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 24 24"
            />
            <span class="ms-3">
              <p class="mb-0">{{ i18n.t("success") }}</p>
              <p class="mb-0">{{ i18n.t("thankYou") }}</p>
            </span>
          </span>
          <span
            v-else-if="requestSuccess === false"
            class="d-flex align-items-center"
          >
            <CancelCircleIcon
              class="icon-cancel-circle"
              width="1.25rem"
              height="1.25rem"
              viewBox="0 0 24 24"
            />
            <span class="mb-0 ms-3">{{ i18n.t("failed") }}</span>
          </span>
        </div>
      </div>
      <div
        class="form-buttons d-flex align-items-end"
        :class="
          showCloseButton ? 'justify-content-end' : 'justify-content-between'
        "
      >
        <button
          v-if="showCancelButton"
          data-qa="feedback cancel button"
          class="btn btn-outline-primary mt-3"
          @click.prevent="$emit('hide')"
        >
          {{ i18n.t("cancel") }}
        </button>
        <div class="button-group-right">
          <button
            v-if="showSkipButton"
            data-qa="feedback skip button"
            class="btn btn-outline-primary mt-3 ms-2"
            :disabled="disableSkipButton"
            @click="skipEmail"
          >
            {{ i18n.t("skipSend") }}
          </button>
          <button
            v-if="showNextButton"
            data-qa="feedback next button"
            class="btn btn-primary button-next-step mt-3"
            type="submit"
            :disabled="disableNextButton"
          >
            {{ i18n.t("next") }}
          </button>
          <button
            v-if="showSendButton"
            data-qa="feedback send button"
            class="btn btn-primary mt-3"
            type="submit"
            :disabled="disableSendButton"
          >
            {{ i18n.t("send") }}
          </button>
          <button
            v-if="showCloseButton"
            data-qa="feedback close button"
            class="btn btn-primary mt-3"
            @click.prevent="$emit('hide')"
          >
            {{ i18n.t("close") }}
          </button>
        </div>
      </div>
      <a
        v-if="config.faqUrl"
        :href="config.faqUrl"
        target="_blank"
        class="faq-link d-inline-flex align-items-center mt-4 mb-2 p-0 w-100 text-decoration-none"
      >
        <span>{{ i18n.t("faq") }}</span>
        <ExternalLinkIcon
          class="icon-external-link ms-1"
          width="1rem"
          height="1rem"
          viewBox="0 0 32 32"
        />
      </a>
    </div>
  </form>
</template>
