import OpenLayersMap from "ol/Map.js";

import EuropeanaMapComponent from "@/components/EuropeanaMap.vue";
import VueLibraryWrapper from "../../../utils/VueLibraryWrapper.js";

export default class EuropeanaMap extends VueLibraryWrapper {
  static CONFIG_KEYS = ["url", "style", "json", "target"];
  static COMPONENT = EuropeanaMapComponent;
  olMap;

  constructor(options = {}) {
    super(options);

    this.olMap = new OpenLayersMap();
    this.app.provide("map", this.olMap);
  }
}
