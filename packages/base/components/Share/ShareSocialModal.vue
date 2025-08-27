<script setup>
defineProps({
  /**
   * Social media networks to display
   *
   */
  shareTo: {
    type: Array,
    default: () => ["bluesky", "facebook"],
  },
});
</script>

<template>
  <div id="share-modal" class="modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header d-block">
          <h2 class="modal-title">{{ $t("actions.share") }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ $t("shareWhere") }}</p>
          <div class="d-flex flex-column flex-sm-row justify-content-between">
            <ShareSocialLink
              v-for="(network, index) in shareTo"
              :key="index"
              :network="network"
              class="share-button me-sm-2 me-4k-4 mb-2 mb-4k-4"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {{ $t("actions.close") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.share-button {
  flex-basis: 33%;

  &:last-child {
    margin-right: 0 !important;
  }
}
</style>
