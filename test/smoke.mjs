import { readFileSync } from "node:fs";
for (const file of ["static/index.html", "static/app.js", "static/styles.css", "src/server.mjs"]) {
  if (readFileSync(file, "utf8").length < 20) throw new Error(`${file} is unexpectedly small`);
}
console.log("sley-workbench smoke ok");
