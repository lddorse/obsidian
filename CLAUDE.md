# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page React 19 + Vite site for "Obsidian", a coffee roastery / cocktail bar, styled as an amber CRT terminal with ASCII art. Plain JSX (no TypeScript), no router, no state library, no test framework, no linter.

## Commands

- `npm run dev` — dev server on port 5173, bound to `0.0.0.0` (reachable from the LAN; see `vite.config.js`)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built output
- `npm run test:status` — plain Node script (`scripts/test-business-status.mjs`) checking the open/closed helper at edge times, including a hypothetical 02:00 close. It loads source through Vite's `ssrLoadModule` because the app's imports have no file extensions. Try it with a different `TZ=` to confirm the visitor's zone doesn't matter.

## Architecture

Content is data-driven: nearly all copy lives in `src/data/`, and components are thin renderers.

- `src/data/menuData.js` — array of menu sections (`id`, `title`, `animation`, `items[]` with `name`, `price`, `description`, `notes`). `App.jsx` maps each section to a `MenuSection`. Adding a section here adds a column to the menu grid.
- `src/data/animations.js` — ASCII animations keyed by name (`coffee`, `cocktail`, `beer`, `snacks`), each `{ frames: [...template strings], speed: ms, stillFrame: index }`. `stillFrame` is the frame shown when `prefers-reduced-motion` is on — pick the most representative one (e.g. the full beer glass), not blindly frame 0. A menu section's `animation` field must match one of these keys or `AnimatedAsciiArt` will crash. Frames are raw template literals: whitespace is significant, and backslashes must be escaped (`\\`). The exported `animations` goes through `normalizeFrames`, which strips any blank rows or columns shared by every frame and pads each frame with spaces to the set's max line count and width. Sizes are made uniform in code, so don't hand-pad frames or offset `.animation-wrapper` in CSS to center the art.
- `src/data/businessInfo.js` — `timeZone` (`America/Chicago`), `hours` and `locationInfo`. Each hours row is `{ day, days, open, close }` with `days` as weekday numbers (0 = Sunday) and times as 24h `"HH:MM"`. The displayed `time` string ("7:00 AM - 12:00 AM") is generated from `open`/`close`, so never hand-write it. A `close` at or before `open` means closing after midnight on the next day (Friday `07:00`–`00:00`).
- `src/utils/businessStatus.js` — `getBusinessStatus(now?, { schedule?, timeZone? })` → `{ isOpen, closesAt, opensAt }`, computed in the bar's time zone via `Intl`, never the visitor's. It checks the previous day's after-midnight hours too, including Saturday night spilling into Sunday. `formatOpensAt` gives "7:00 AM" / "TOMORROW 8:00 AM" / "MON 7:00 AM". Reuse this helper anywhere the site needs open/closed status. Holiday and special closures aren't supported yet: the schedule is purely weekly.

Entry gate: `App` renders `EntryGate` over the site on every page load and makes the site `inert` while it's up. When open, the sign flickers on letter by letter every time, and there's no session or storage logic. The gate recomputes status at each minute boundary. Its sign waits (≤1s) for Monoton to load before appearing. The lit/unlit look is each letter's resting style and the flicker only plays on top, so the global reduced-motion rule leaves the sign lit or unlit with no extra JS. Focus goes to the dialog, not the "tap to enter" button, so the button stays faint until tabbed to.

`src/hooks/usePrefersReducedMotion.js` tracks the OS setting live (`matchMedia` change listener). Use it for any JS-driven motion. CSS animations are already covered by the `prefers-reduced-motion` block at the end of `App.css`, which must stay last.

Click flow: `MenuSection` item click → `App`'s `selectedItem` state → `Modal` (closes on Esc, overlay click, or ✕).

`Hours.jsx` and `LocationInfo.jsx` are unused leftovers; `InfoSection.jsx` supersedes them by combining about/hours/location in one frame.

## Styling

All styles are in one global stylesheet, `src/App.css` (no CSS modules). Box frames are drawn with absolutely positioned `.frame-corners` spans (`tl/tr/bl/br`) plus `║ … ║` around headings — reuse that pattern for new framed panels. The responsive breakpoint is `max-width: 968px`.

## Design rules

- Amber CRT palette: `#ffb000` primary, `#cc8800` accents, `#0a0a0a` background.
- Every frame in an ASCII animation set must have exactly the same line count and width, or the layout jumps (`normalizeFrames` in `animations.js` enforces this).
- The scanline effect goes only on h1/h2 headings, never on containers (on containers it made the whole page twitch).
- Use box-drawing characters (`╔ ╗ ╚ ╝ ║ ═`) for frames and headings.
- Inside the site, use a monospace terminal style. Neon (the Monoton font, loaded from Google Fonts in `index.html`) is only for the entry gate/logo.
- All animations must respect `prefers-reduced-motion`.

## Repo quirks

- The file named `package` (no extension) at the root is a stale older copy of `package.json` (React 18 / Vite 5) and is not used by npm.
