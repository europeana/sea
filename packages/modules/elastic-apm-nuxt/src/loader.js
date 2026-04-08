import { register } from "node:module";
import { pathToFileURL } from "node:url";
register("elastic-apm-node/loader.mjs", pathToFileURL("./"));
