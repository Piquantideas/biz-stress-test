#!/usr/bin/env node
// Builds scorecard/index.html by inlining engine/engine.js into src/scorecard.html at the /*ENGINE*/ marker.
//   node build.js          write scorecard/index.html
//   node build.js --check  exit 1 if scorecard/index.html is out of date (no write)
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const TEMPLATE = path.join(ROOT, "src", "scorecard.html");
const ENGINE = path.join(ROOT, "engine", "engine.js");
const OUT = path.join(ROOT, "scorecard", "index.html");
const MARKER = "/*ENGINE*/\n";

function build() {
  const template = fs.readFileSync(TEMPLATE, "utf8");
  const engine = fs.readFileSync(ENGINE, "utf8");
  const parts = template.split(MARKER);
  if (parts.length !== 2) throw new Error("src/scorecard.html must contain the /*ENGINE*/ marker exactly once, on its own line");
  return parts[0] + engine + parts[1];
}

if (require.main === module) {
  const html = build();
  if (process.argv.includes("--check")) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (current !== html) {
      console.error("scorecard/index.html is out of date. Run: node build.js");
      process.exit(1);
    }
    console.log("scorecard/index.html is up to date.");
  } else {
    fs.writeFileSync(OUT, html);
    console.log("Wrote scorecard/index.html (" + Buffer.byteLength(html) + " bytes).");
  }
}

module.exports = { build };
