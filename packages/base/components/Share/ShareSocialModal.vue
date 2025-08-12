<script setup>
defineProps({
  mediaUrl: {
    type: String,
    default: null,
  },
  shareTo: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div id="share-modal" class="modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t("actions.share") }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ $t("shareWhere") }}</p>
          <div class="icon-wrapper pt-1 mb-4">
            <ShareSocialButtons :media-url="mediaUrl" :share-to="shareTo" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          {{ $t("actions.close") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "@europeana/style/scss/variables";
#share-modal {
  .modal-content {
    .modal-body {
      .icon-wrapper > div {
        display: flex;
        justify-content: space-between;
      }

      @media (max-width: $bp-small) {
        .icon-wrapper > div {
          flex-direction: column;
        }
      }
    }
  }
}
</style>
