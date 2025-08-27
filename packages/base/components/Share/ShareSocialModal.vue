<script setup>
defineProps({
  mediaUrl: {
    type: String,
    default: null,
  },
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
            <ShareSocialButtons :share-to="shareTo" />
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
