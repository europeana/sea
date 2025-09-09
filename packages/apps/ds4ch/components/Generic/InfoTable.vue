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
    <table class="table">
      <tbody>
        <tr v-for="(entry, index) in tableData" :key="index">
          <td>{{ entry.label }}</td>
          <td>
            <GenericSmartLink v-if="entry.url" :destination="entry.url">
              <span
                v-if="entry.icon"
                class="btn-primary"
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
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/icon-font";
@import "@europeana/style/scss/table";
@import "assets/scss/variables";
.info-table {
  td.table-name-cell {
    overflow-wrap: anywhere;
  }
}
</style>
