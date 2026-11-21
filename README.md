# gta6-cover-art-01

[![make.fun](https://make.fun/badge/competition/gta6-cover-art-01)](https://make.fun/competitions/gta6-cover-art-01)
[![make.fun rank](https://make.fun/badge/rank/gta6-cover-art-01)](https://make.fun/competitions/gta6-cover-art-01)
[![make.fun reward](https://make.fun/badge/reward/gta6-cover-art-01)](https://make.fun/competitions/gta6-cover-art-01)

**VICE COVER STUDIO** — turn your own photo into a striking sunset cover poster, right in the browser. Multi-panel layouts (1/2/3/4), per-panel crop with a different focus point, a bold caption editor (SUNSET / NEON / NOIR), and one-click PNG export at 1080×1080, 1080×1350 or 1920×1080.

Everything runs 100% offline: photos are read on your device and never uploaded. The sunset sky, retro sun, palm silhouettes and city skyline are all drawn in code — no external assets, no stock art, no logos.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — add your photos (or load the samples), pick a layout, write a caption, and hit **Export PNG**.

## How it works

- `app/index.html` + `app/style.css` + `app/app.js` — the editor (plain static files, no build step)
- `app/samples/` — two sample photos included with the kit
- `main.ts` — copies `app/` + `screenshots/` to the output dir and writes `dossier.json` via `buildDossier`

Entered on [make.fun](https://make.fun/?ref=gv8v1562&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
