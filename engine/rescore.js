#!/usr/bin/env node
// Re-scores past scorecard responses with a proposed library, to see what a change would do before it ships.
//
//   node engine/rescore.js <export> [--base <engine>] [--engine <engine>] [--all] [--json]
//
//   <export>    The Responses tab, exported as CSV, or as the JSON a Sheets values read returns ({"values": [...]}).
//               Keep exports OUTSIDE this repo: they hold personal data and the repo is public.
//   --base      Engine the "before" scores come from. Default: git:main (engine/engine.js on main).
//               Accepts a file path or git:<ref>.
//   --engine    Engine with the proposed library. Default: engine/engine.js in the working tree.
//   --all       Include Reviewer responses (default: owners only, as the decision rules require).
//   --json      Print machine-readable results instead of the summary.
//
// Answers are stored as option text. Each is matched to its option position in the base engine and scored at
// the same position in the proposed one, so a reworded question keeps its answers. Personal data columns
// (name, business, email, phone) are never read. Groups under 3 responses are shown as "<3".
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const COL = { version: 2, type: 3, category: 4, pri: 9, band: 12, felt: 28, answers: 40 };
const MIN_GROUP = 3;

function args(argv) {
  const a = { file: null, base: "git:main", engine: path.join(__dirname, "engine.js"), all: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--base") a.base = argv[++i];
    else if (v === "--engine") a.engine = argv[++i];
    else if (v === "--all") a.all = true;
    else if (v === "--json") a.json = true;
    else a.file = v;
  }
  if (!a.file) { console.error("Usage: node engine/rescore.js <export.csv|json> [--base git:main|file] [--engine file] [--all] [--json]"); process.exit(2); }
  return a;
}

function loadEngine(spec) {
  let file = spec;
  if (spec.startsWith("git:")) {
    let src;
    try {
      src = execFileSync("git", ["show", spec.slice(4) + ":engine/engine.js"], { cwd: path.join(__dirname, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch (e) {
      console.error(`No engine/engine.js on ${spec.slice(4)}. Pass --base <file> instead.`);
      process.exit(2);
    }
    file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pri-")), "engine.js");
    fs.writeFileSync(file, src);
  }
  const abs = path.resolve(file);
  delete require.cache[abs];
  const e = require(abs);
  const m = fs.readFileSync(abs, "utf8").match(/LIBRARY_VERSION\s*=\s*"([^"]+)"/);
  e.version = m ? m[1] : "?";
  return e;
}

function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function readRows(file) {
  const text = fs.readFileSync(file, "utf8");
  let rows;
  if (/^\s*[\[{]/.test(text)) { const j = JSON.parse(text); rows = Array.isArray(j) ? j : j.values; }
  else rows = parseCSV(text);
  const head = rows.findIndex((r) => r.some((c) => String(c).trim() === "Answers"));
  return rows.slice(head >= 0 ? head + 1 : 0).filter((r) => r[COL.answers]);
}

function toIndices(base, list) {
  const answers = {}, missing = [];
  list.forEach(({ id, answer }) => {
    const q = base.Q[id];
    const i = q ? q.options.findIndex((o) => o[0] === answer) : -1;
    if (i < 0) missing.push(id); else answers[id] = i;
  });
  return { answers, missing };
}

const BAND = { actnow: "Act now", exposed: "Exposed", prepared: "Prepared" };
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const fmt = (x, d = 1) => x === null ? "–" : (x > 0 ? "+" : "") + x.toFixed(d);
const n3 = (n) => n < MIN_GROUP ? "<3" : String(n);

function run(a) {
  const base = loadEngine(a.base), next = loadEngine(a.engine);
  const results = [], skipped = { reviewer: 0, unmatched: 0, badJson: 0, noFlow: 0 };
  readRows(a.file).forEach((r) => {
    const type = String(r[COL.type]).trim();
    if (!a.all && type !== "Owner") { skipped.reviewer++; return; }
    let list;
    try { list = JSON.parse(r[COL.answers]); } catch (e) { skipped.badJson++; return; }
    const category = String(r[COL.category]).trim();
    const { answers, missing } = toIndices(base, list);
    const flow = base.FLOWS[base.packFor(category)] || [];
    if (!flow.length) { skipped.noFlow++; return; }
    if (missing.length || flow.some((id) => answers[id] === undefined)) { skipped.unmatched++; return; }
    const nextFlow = next.FLOWS[next.packFor(category)] || [];
    if (nextFlow.some((id) => answers[id] === undefined || !next.Q[id] || !next.Q[id].options[answers[id]])) { skipped.unmatched++; return; }
    const before = base.score(category, answers, "moderate"), after = next.score(category, answers, "moderate");
    results.push({ category, type, felt: String(r[COL.felt]).trim(), shown: Number(String(r[COL.pri]).replace(/[^0-9.\-]/g, "")),
      before: before.pri, after: after.pri, shift: after.pri - before.pri, bandBefore: before.band, bandAfter: after.band });
  });

  const groups = {};
  results.forEach((x) => { (groups[x.category] = groups[x.category] || []).push(x); });
  const industries = Object.keys(groups).sort().map((k) => ({
    industry: k, n: groups[k].length,
    avgBefore: mean(groups[k].map((x) => x.before)), avgAfter: mean(groups[k].map((x) => x.after)),
    avgShift: mean(groups[k].map((x) => x.shift)), bandChanges: groups[k].filter((x) => x.bandBefore !== x.bandAfter).length
  }));
  // Judge fit only on responses the change actually moves, so unaffected industries don't dilute it.
  const moved = results.filter((x) => Math.abs(x.shift) > 1e-9);
  const felt = {};
  ["Too soft", "Too harsh", "About right"].forEach((f) => {
    const xs = moved.filter((x) => x.felt === f);
    felt[f] = { n: xs.length, avgShift: mean(xs.map((x) => x.shift)), avgAbsShift: mean(xs.map((x) => Math.abs(x.shift))) };
  });
  // Fit gets worse if "Too soft" scores rise or "Too harsh" scores fall on average.
  const worse = (felt["Too soft"].n && felt["Too soft"].avgShift > 0.05) || (felt["Too harsh"].n && felt["Too harsh"].avgShift < -0.05);
  const better = (felt["Too soft"].n && felt["Too soft"].avgShift < -0.05) || (felt["Too harsh"].n && felt["Too harsh"].avgShift > 0.05);
  const verdict = worse ? "worse" : better ? "better" : "unchanged";
  const moves = {};
  results.filter((x) => x.bandBefore !== x.bandAfter).forEach((x) => { const k = BAND[x.bandBefore] + " → " + BAND[x.bandAfter]; moves[k] = (moves[k] || 0) + 1; });
  return { base: base.version, next: next.version, scored: results.length, skipped, industries, felt, moves, verdict,
    shownMismatch: results.filter((x) => Number.isFinite(x.shown) && Math.abs(x.shown - x.before) > 0.15).length };
}

function report(s, a) {
  const L = [];
  L.push(`Re-scored ${s.scored} ${a.all ? "" : "owner "}responses: ${s.base} → ${s.next}. Fit: ${s.verdict}.`);
  const sk = Object.entries(s.skipped).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(", ");
  if (sk) L.push(`Skipped: ${sk}.`);
  if (s.shownMismatch) L.push(`Note: ${s.shownMismatch} responses were shown a score that differs from the base engine's (likely scored on an older version).`);
  L.push("", "| Industry | Responses | Avg PRI before | Avg PRI after | Avg shift | Changed band |", "|---|---|---|---|---|---|");
  s.industries.forEach((g) => L.push(g.n < MIN_GROUP
    ? `| ${g.industry} | <3 | – | – | – | – |`
    : `| ${g.industry} | ${g.n} | ${g.avgBefore.toFixed(1)} | ${g.avgAfter.toFixed(1)} | ${fmt(g.avgShift)} | ${g.bandChanges} |`));
  L.push("", "| Said the score was (responses the change moves) | Responses | Avg shift | Wanted |", "|---|---|---|---|");
  [["Too soft", "down"], ["Too harsh", "up"], ["About right", "little change"]].forEach(([f, want]) => {
    const g = s.felt[f];
    L.push(`| ${f} | ${n3(g.n)} | ${g.n < MIN_GROUP ? "–" : fmt(g.avgShift)} | ${want} |`);
  });
  const mv = Object.entries(s.moves).filter(([, v]) => v >= MIN_GROUP);
  if (mv.length) L.push("", "Band moves: " + mv.map(([k, v]) => `${k} ${v}`).join("; ") + ".");
  return L.join("\n");
}

if (require.main === module) {
  const a = args(process.argv.slice(2));
  const s = run(a);
  console.log(a.json ? JSON.stringify(s, null, 2) : report(s, a));
}

module.exports = { run, report, parseCSV };
