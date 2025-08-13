<script setup>
import { camelCase } from "lodash-es";

const { t, n } = useI18n({ useScope: "global" });
const DS4CH_NUMBERS = "Data space numbers";

const props = defineProps({
  /**
   * Genre that identifies the type of data to be fetched and displayed
   * Needs to match DS4CH_NUMBERS
   */
  genre: {
    type: String,
    default: null,
  },
  /**
   * List of static items to use in storybook
   */
  staticItems: {
    type: Array,
    default: () => [],
  },
});

const keys = [
  "items/type-counts",
  "dataspace/network-members",
  "dataspace/data-providers",
  "dataspace/hq-data",
  "dataspace/api-requests",
];

const fetchCachedData = () => {
  // TODO: Re-introduce serverside reading from redis directly. Requires redis connection.
  // and/or setting up api endpoints per: https://nuxt.com/docs/3.x/guide/directory-structure/server

  // OR:

  // TODO: Allow cors requests from the portal side so we can get live numbers.

  // const queryIds = `?id=${keys.join('&id=')}`;
  // return $fetch(`/_api/cache${queryIds}`, { baseURL: 'https://www.europeana.eu' }) // TODO: REPLACE BASEURL with Variable
  //   .then((response) => response.data);
  return {
    "items/type-counts": [
      {
        label: "IMAGE",
        count: 36590873,
      },
      {
        label: "TEXT",
        count: 26315791,
      },
      {
        label: "SOUND",
        count: 1201557,
      },
      {
        label: "VIDEO",
        count: 364755,
      },
      {
        label: "3D",
        count: 6569,
      },
    ],
    "dataspace/network-members": 4500,
    "dataspace/data-providers": 3500,
    "dataspace/hq-data": "+10%",
    "dataspace/api-requests": 13000000,
  };
};

const { data } = useAsyncData(`automatedCardGroup:${props.genre}`, async () => {
  const entries = [];
  if (props.genre === DS4CH_NUMBERS && !props.staticItems.length) {
    const cachedData = await fetchCachedData();

    for (const key of keys) {
      const entry = {
        info: cachedData[key],
        label: camelCase(key.split("/").pop()),
      };
      if (key === "items/type-counts") {
        entry.label = "items";
        entry.info = cachedData[key]
          ?.map((data) => data.count)
          .reduce((a, b) => a + b);
      }
      entries.push(entry);
    }
  }
  return entries;
});

const roundedNumber = (number) => {
  const precision = 2;
  const numberLength = number?.toString().length;
  // Number is always rounded down as a plus (+) is added to the count string.
  const floorRoundedNumber =
    Math.floor(number / 10 ** (numberLength - precision)) *
    10 ** (numberLength - precision);
  return Number(floorRoundedNumber.toFixed());
};

const hasPartCollectionItems = computed(() => {
  let items;

  if (props.staticItems.length) {
    items = props.staticItems;
  } else {
    items = data.value?.map((entry) => ({
      info: isNaN(entry.info)
        ? entry.info
        : n(roundedNumber(entry.info)) + " +",
      label: t(`landing.counts.${entry.label}`),
    }));
  }
  return items || [];
});
</script>

<template>
  <div class="landing-automated-card-group">
    <div
      v-if="hasPartCollectionItems.length"
      class="d-flex flex-wrap justify-content-center"
    >
      <GenericInfoCard
        v-for="(item, index) in hasPartCollectionItems"
        :key="index"
        :info="item.info"
        :label="item.label"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.landing-automated-card-group {
  margin-bottom: 2rem;
  margin-right: auto;
  margin-left: auto;
  max-width: $max-text-column-width;

  @media (min-width: $bp-large) {
    margin-bottom: 4rem;
  }

  @media (min-width: $bp-4k) {
    margin-bottom: 13rem;
    max-width: 2000px;
  }

  :deep(.info-card) {
    background-color: transparent;

    padding-left: 0.5rem;
    padding-right: 0.5rem;

    @media (min-width: $bp-small) {
      flex-basis: 50%;
    }

    @media (min-width: $bp-medium) {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: $bp-large) {
      flex-basis: auto;
    }

    @media (min-width: $bp-4k) {
      max-width: none;
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .card-title {
      @extend %title-2;
      color: $black;
      margin-bottom: 0.875rem;

      @media (min-width: $bp-medium) {
        margin-bottom: 1rem;
        white-space: nowrap;
      }
    }

    .card-text {
      @extend %title-5;
      color: $darkgrey;
      max-width: 145px;

      @media (min-width: $bp-small) {
        max-width: 200px;
      }

      @media (min-width: $bp-4k) {
        max-width: 510px;
      }
    }

    .card-body {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      @media (min-width: $bp-small) {
        padding: 1rem;
      }

      @media (min-width: $bp-large) {
        padding: 2rem;
      }
    }
  }
}
</style>
