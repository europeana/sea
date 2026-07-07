import { createApp, computed, reactive } from "vue";

export default class VueLibraryWrapper {
  static CONFIG_KEYS = [];
  static COMPONENT;

  app;
  config = reactive({});

  constructor(options = {}) {
    for (const configKey of this.constructor.CONFIG_KEYS) {
      this.config[configKey] = options[configKey];
    }

    this.app = createApp(this.constructor.COMPONENT);
    this.app.provide(
      "config",
      computed(() => this.config),
    );
  }

  mount(target) {
    this.app.mount(target);
  }

  set(name, value) {
    if (this.constructor.CONFIG_KEYS.includes(name)) {
      this.config[name] = value;
    }
  }
}
