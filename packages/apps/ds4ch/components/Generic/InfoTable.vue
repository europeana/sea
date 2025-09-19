<script setup>
defineProps({
  /**
   * An array of the data to be displayed.
   * Must contain labels and values.
   * Entries with a URL attirbute will turn the value into a link.
   */
  tableData: {
    type: Array[Object],
    required: true,
  },
});
</script>

<template>
  <div class="info-table">
    <table class="table borderless w-100">
      <tbody>
        <tr
          v-for="(entry, index) in tableData"
          :key="index"
          class="d-flex d-sm-table-row flex-column"
        >
          <td class="label-cell">{{ entry.label }}</td>
          <td class="value-cell text-sm-end fw-semibold">
            <GenericSmartLink
              v-if="entry.url"
              :destination="entry.url"
              :hide-external-icon="!!entry.icon"
            >
              <span
                v-if="entry.icon"
                class="btn-primary d-inline-flex align-items-center justify-content-center"
                :class="`icon-${entry.icon}`"
              />
              <span v-if="entry.value">
                {{ entry.value }}
              </span>
            </GenericSmartLink>
            <span v-else>
              {{ entry.value }}
            </span>
          </td>
        </tr>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/icon-font";
@import "assets/scss/variables";
@import "assets/scss/table";

.info-table {
  td.label-cell {
    line-height: 1.5em;
    overflow-wrap: anywhere;
  }
  td.value-cell {
    border-top-width: 0;
    color: $darkgrey;
    padding-top: 0;

    @media (min-width: $bp-small) {
      border-top-width: 1px;
      padding-top: 1rem;
    }

    @media (min-width: $bp-4k) {
      padding-top: 2rem;
    }

    a {
      color: $darkgrey;

      &:hover {
        color: $black;
        transition: $standard-transition;
      }
    }
  }

  .icon-ic-download {
    height: 1.5rem;
    width: 1.5rem;
    background-color: $black;
    color: $white;
    border-radius: 50%;
    font-size: $font-size-18;

    @media (min-width: $bp-4k) {
      height: 3rem;
      width: 3rem;
      font-size: $font-size-36;
    }
  }
}
</style>
