import { query } from "./query.js";

const VueContentfulGraphql = {
  install(app, config) {
    const $contentful = {
      query: (ast, variables) => query(ast, variables, config),
    };

    if (app.version > "3") {
      app.provide("$contentful", $contentful);
    } else {
      app.prototype.$contentful = $contentful;
    }
  },
};

export default VueContentfulGraphql;
