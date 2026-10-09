# PRI refinement loop: how the code side works

The weekly loop reads scorecard responses, checks them against the Piquant Relevance Index methodology, and
proposes small, evidenced library changes for Celestine to approve. The full brief (decision rules, guardrails,
report format) is the "PRI Refinement Loop: Brief for Claude Code" document; it wins if anything here disagrees.

## Layout

| Path | What it is |
|---|---|
| `engine/engine.js` | The scoring engine and library (`LIBRARY_VERSION`, `LIB`, `Q`, `FLOWS`). **Edit the library here.** |
| `src/scorecard.html` | The scorecard page, with a `/*ENGINE*/` marker where the engine goes. Edit page layout and text here. |
| `build.js` | Inlines the engine into the page and writes `scorecard/index.html`. |
| `scorecard/index.html` | The built page GitHub Pages serves. **Never edit by hand.** |
| `engine/test.js` | Library checks, build check and snapshot tests for all 5 packs. |
| `engine/snapshots.json` | Recorded scores for the current `LIBRARY_VERSION`. |
| `engine/rescore.js` | Re-scores exported responses with a proposed library. |
| `index.html` | The older F&B review copy (Culinex). Separate engine; don't change unless asked. |

## Commands

```bash
npm run build                  # rebuild scorecard/index.html
npm test                       # must pass before any pull request
node engine/test.js --update   # record snapshots, only after bumping LIBRARY_VERSION
node engine/rescore.js <export.json> --base git:main --engine engine/engine.js
```

## A library change, step by step

1. Branch from main: `git checkout -b loop/YYYY-MM-DD`.
2. Edit the numbers or question wording in `engine/engine.js`. Keep the same answer scores when rewording;
   weights per pack total 100, none under 5, and no weight moves more than 5 points per release.
3. Bump `LIBRARY_VERSION` (v1.1 → v1.2). One new version a month at most.
4. `npm run build`, then `node engine/test.js --update`, then `npm test`.
5. Export the Responses tab to a file **outside the repo** and run `rescore.js` against main. Drop any proposal
   whose fit comes out "worse".
6. Commit, push the branch, open a **draft** pull request with the rescore summary. Never merge; never push to main.
7. After Celestine approves (merges or replies "approved"): update the workbook's library tabs, Changelog,
   Assumption Register and the Pilot Summary version list, and propose any wording change to the methodology
   document. A change isn't done until the scorecard, workbook and methodology carry the same version.

## Never

- Commit exports, names, business names, emails, phones or raw answers. This repo is public.
- Rename, reorder or insert columns in the Responses tab, or redeploy the Apps Script, without approval.
- Show any group smaller than 3 in a report or pull request.
