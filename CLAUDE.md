# Project workflow

- **Push directly to `main`.** For this project, commit and push changes straight to `main` — no feature branch, no pull request, unless explicitly asked otherwise.

# Stack

- Vite + React 19 + TypeScript single-page app. Entry: `src/main.tsx` → `src/App.tsx`.
- `src/App.tsx` is a self-contained personal planning system (Quarterly / Weekly / Daily tabs) with all styling in an inline `<style>` block.
- `src/WheelChart.tsx` is a dependency-free interactive SVG spider chart used for the Wheel of Life (quarterly) and the Weekly Wheel of Life Pulse.

# Checks

- Build: `npm run build` (runs `tsc -b` then `vite build`).
- Lint: `npm run lint`.
- Run both before pushing.
