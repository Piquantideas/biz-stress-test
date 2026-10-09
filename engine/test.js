#!/usr/bin/env node
// Engine tests.
//   node engine/test.js            run the checks
//   node engine/test.js --update   record new snapshots (only after bumping LIBRARY_VERSION)
//
// Snapshots score fixed answer sets for every pack. If a score moves while LIBRARY_VERSION stays the same,
// the test fails: a library change must always come with a version bump, so every response stays traceable.
"use strict";
const fs = require("fs");
const path = require("path");
const E = require("./engine.js");
const { build } = require("../build.js");

const SNAP = path.join(__dirname, "snapshots.json");
const VERSION = readVersion();
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

function readVersion() {
  const m = fs.readFileSync(path.join(__dirname, "engine.js"), "utf8").match(/LIBRARY_VERSION\s*=\s*"([^"]+)"/);
  return m ? m[1] : null;
}

// ---------- library integrity ----------
Object.entries(E.LIB.packs).forEach(([name, p]) => {
  const sum = p.weights.reduce((a, b) => a + b, 0);
  check(p.weights.length === E.LIB.dims.length, `${name}: needs ${E.LIB.dims.length} weights`);
  check(Math.abs(sum - 100) < 1e-9, `${name}: weights total ${sum}, not 100`);
  check(p.weights.every((w) => w >= 5), `${name}: a weight is under 5`);
  check(p.target > p.floor, `${name}: target margin must be above the floor`);
});
Object.entries(E.FLOWS).forEach(([pack, ids]) => {
  check(E.LIB.packs[pack], `FLOWS has pack ${pack} with no sector pack`);
  ids.forEach((id) => check(E.Q[id], `${pack} flow uses unknown question ${id}`));
  check(ids.includes("REV") && ids.includes("MARGIN"), `${pack} flow must ask REV and MARGIN`);
  E.LIB.dims.forEach((d) => check(ids.some((id) => E.Q[id].dim === d.id), `${pack} flow has no question for ${d.name}`));
});
Object.entries(E.Q).forEach(([id, q]) => {
  q.options.forEach((o) => {
    if (q.kind === "ready") {
      check(o[1] >= 0 && o[1] <= 3, `${id}: readiness score ${o[1]} outside 0 to 3`);
      if (o[2]) check(E.LIB.plays[o[2]], `${id}: unknown play ${o[2]}`);
    }
  });
});
Object.entries(E.LIB.plays).forEach(([id, p]) => {
  Object.keys(E.LIB.packs).forEach((pack) => check(p.ex[pack], `Play ${id} has no example for ${pack}`));
});
E.INDUSTRIES.forEach((g) => check(E.LIB.packs[g.pack], `Industry ${g.label} points to unknown pack ${g.pack}`));

// ---------- fixed answer sets ----------
// For each pack: every answer at the first option, the second, the middle and the last.
function cases() {
  const out = {};
  E.INDUSTRIES.forEach((g) => {
    const flow = E.FLOWS[g.pack];
    // "mixed" sets vary by question, so areas score differently and a weight change moves the PRI.
    [["first", () => 0], ["second", () => 1], ["middle", (n) => Math.floor((n - 1) / 2)], ["last", (n) => n - 1],
     ["mixed", (n, i) => (i * 2) % n], ["mixed-reverse", (n, i) => n - 1 - ((i * 2) % n)]].forEach(([label, pick]) => {
      const answers = {};
      flow.forEach((id, i) => { const n = E.Q[id].options.length; answers[id] = Math.min(pick(n, i), n - 1); });
      ["moderate", "severe"].forEach((sc) => {
        if (sc === "severe" && g.pack !== "F&B") return;
        const r = E.score(g.label, answers, sc);
        check(r.pri >= 0 && r.pri <= 100, `${g.pack}/${label}: PRI ${r.pri} outside 0 to 100`);
        check(Number.isFinite(r.pri), `${g.pack}/${label}: PRI is not a number`);
        check(r.plays.length === 3, `${g.pack}/${label}: expected 3 plays, got ${r.plays.length}`);
        out[`${g.pack}/${label}/${sc}`] = {
          pri: round(r.pri), band: r.band, readiness: round(r.readiness), buffer: round(r.buffer),
          profitIfHit: Math.round(r.profitIfHit), plays: r.plays.map((p) => p.id).join(",")
        };
      });
    });
  });
  return out;
}
const round = (x) => Math.round(x * 1000) / 1000;
const current = cases();

// ---------- build ----------
const page = fs.readFileSync(path.join(__dirname, "..", "scorecard", "index.html"), "utf8");
check(page === build(), "scorecard/index.html is out of date: run node build.js");

// ---------- snapshots ----------
if (process.argv.includes("--update")) {
  const old = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : null;
  if (old && old.version === VERSION && JSON.stringify(old.cases) !== JSON.stringify(current)) {
    console.error(`Scores changed but LIBRARY_VERSION is still ${VERSION}. Bump the version before updating snapshots.`);
    process.exit(1);
  }
  fs.writeFileSync(SNAP, JSON.stringify({ version: VERSION, cases: current }, null, 2) + "\n");
  console.log(`Recorded ${Object.keys(current).length} snapshots for ${VERSION}.`);
} else if (!fs.existsSync(SNAP)) {
  failures.push("No snapshots yet: run node engine/test.js --update");
} else {
  const snap = JSON.parse(fs.readFileSync(SNAP, "utf8"));
  if (snap.version !== VERSION) {
    failures.push(`Snapshots are for ${snap.version} but the engine is ${VERSION}. If the change is intended, run node engine/test.js --update.`);
  } else {
    Object.keys({ ...snap.cases, ...current }).forEach((k) => {
      const a = JSON.stringify(snap.cases[k]), b = JSON.stringify(current[k]);
      if (a !== b) failures.push(`${k} moved without a version bump:\n    was ${a}\n    now ${b}`);
    });
  }
}

if (failures.length) {
  console.error(`FAIL (${failures.length})\n- ` + failures.join("\n- "));
  process.exit(1);
}
console.log(`PASS: library ${VERSION}, ${Object.keys(current).length} scored cases, build up to date.`);
