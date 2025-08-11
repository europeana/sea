<script setup>
const props = defineProps({
  html: {
    type: String,
    required: true,
  },
  height: {
    type: [Number, String],
    default: null,
  },
  width: {
    type: [Number, String],
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  responsive: {
    type: Boolean,
    default: false,
  },
});

let embedCode = props.html;
const widthWrapper = ref(0);

const heightAsPercentOfWidth = computed(() => {
  return (props.height * 100) / props.width;
});

const embedContainerTemplateRef = useTemplateRef("embedContainer");
const responsiveWrapperTemplateRef = useTemplateRef("responsiveWrapper");

onMounted(() => {
  findAndReappendScripts();

  setWidthWrapper();
  window.addEventListener("resize", setWidthWrapper);

  if (props.title) {
    const iframe =
      embedContainerTemplateRef.value.getElementsByTagName("iframe")?.[0];
    iframe?.setAttribute("title", props.title);
  }
});

const setWidthWrapper = () => {
  if (responsiveWrapperTemplateRef.value) {
    const wrapperHeight = responsiveWrapperTemplateRef.value.clientHeight;
    widthWrapper.value = (props.width * wrapperHeight) / props.height;
  }
};

// Reappends scripts so they are executed. Scripts added through v-html are not executed
const findAndReappendScripts = () => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(props.html, "text/html");
  const scripts = doc.querySelectorAll("script");

  if (scripts.length) {
    scripts.forEach((script) => {
      const newScript = document.createElement("script");

      for (const attr of script.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }

      // for inline script content
      newScript.textContent = script.textContent;

      embedContainerTemplateRef.value.after(newScript);

      // remove script from embedCode so it's not added through v-html
      script.remove();
    });
    embedCode = doc.body.innerHTML;
  }
};
</script>
<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    v-if="responsive && height && width"
    ref="responsiveWrapper"
    class="responsive-embed-wrapper"
    :style="`width:${widthWrapper}px`"
    data-qa="responsive embed wrapper"
  >
    <div
      ref="embedContainer"
      data-qa="html embed"
      class="html-embed"
      :style="`padding-bottom:${heightAsPercentOfWidth}%`"
      v-html="embedCode"
    />
  </div>
  <div
    v-else
    ref="embedContainer"
    data-qa="html embed"
    class="html-embed"
    v-html="embedCode"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/mixins";

.html-embed {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  :deep(iframe) {
    display: inline;
    margin-right: auto;
    margin-left: auto;
    border: 0;
    box-shadow: none;
  }

  :deep(.sketchfab-embed-wrapper) {
    width: 100%;

    iframe {
      width: 100%;
      @include media-viewer-height;
    }
  }
}

.responsive-embed-wrapper {
  @include media-viewer-height;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;

  .html-embed {
    display: block;
    position: relative;
    height: 0;
    overflow: hidden;

    :deep(iframe) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
