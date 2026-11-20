import fs from "fs";
import ssri from "ssri";

import pkg from "../package.json" with { type: "json" };

const readmeUrl = new URL("../README.md", import.meta.url);

let readme = fs.readFileSync(readmeUrl, { encoding: "utf8" });
readme = readme.replace(
  /@europeana\/feedback-widget(@.+)?\/dist\//g,
  `@europeana/feedback-widget@${pkg.version}/dist/`,
);

const distScriptUrl = new URL(
  "../dist/europeana-feedback-widget.app.js",
  import.meta.url,
);
const distScriptIntegrity = ssri.fromData(fs.readFileSync(distScriptUrl), {
  algorithms: ["sha384"],
});
readme = readme.replace(
  /integrity="sha384-[^"]*"/g,
  `integrity="${distScriptIntegrity.sha384.toString()}"`,
);

fs.writeFileSync(readmeUrl, readme);
