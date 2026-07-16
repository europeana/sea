import { createApp, computed, reactive } from "vue";
import OpenLayersMap from "ol/Map.js";

import EuropeanaMapComponent from "@/components/EuropeanaMap.vue";

export default class EuropeanaMap {
  #app;
  #olMap;
  #config = reactive({});

  constructor(target, options = {}) {
    this.#olMap = new OpenLayersMap({ controls: [] });

    for (const prop in EuropeanaMapComponent.props) {
      this.#config[prop] = options[prop];
    }

    this.#app = createApp(EuropeanaMapComponent);
    this.#app.provide(
      "config",
      computed(() => this.#config),
    );
    this.#app.provide("map", this.#olMap);
    this.#app.mount(target);
  }

  get config() {
    return this.#config;
  }

  get app() {
    return this.#app;
  }

  get olMap() {
    return this.#olMap;
  }

  set(name, value) {
    if (Object.hasOwn(this.#config, name)) {
      this.#config[name] = value;
    }
  }
}
