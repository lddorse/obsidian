# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page React 19 + Vite site for "Obsidian", a coffee roastery / cocktail bar, styled as an amber CRT terminal with ASCII art. Plain JSX (no TypeScript), no router, no state library, no tests, no linter.

## Commands

- `npm run dev` — dev server on port 5173, bound to `0.0.0.0` (reachable from the LAN; see `vite.config.js`)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built output

## Architecture

Content is data-driven: nearly all copy lives in `src/data/`, and components are thin renderers.

- `src/data/menuData.js` — array of menu sections (`id`, `title`, `animation`, `items[]` with `name`, `price`, `description`, `notes`). `App.jsx` maps each section to a `MenuSection`. Adding a section here adds a column to the menu grid.
- `src/data/animations.js` — ASCII animations keyed by name (`coffee`, `cocktail`, `beer`, `snacks`), each `{ frames: [...template strings], speed: ms, stillFrame: index }`. `stillFrame` is the frame shown when `prefers-reduced-motion` is on — pick the most representative one (e.g. the full beer glass), not blindly frame 0. A menu section's `animation` field must match one of these keys or `AnimatedAsciiArt` will crash. Frames are raw template literals: whitespace is significant, backslashes must be escaped (`\\`), and all frames in one animation must be the same size (see Design rules).
- `src/data/businessInfo.js` — `hours` and `locationInfo`, rendered by `InfoSection`.

Click flow: `MenuSection` item click → `App`'s `selectedItem` state → `Modal` (closes on Esc, overlay click, or ✕).

`Hours.jsx` and `LocationInfo.jsx` are unused leftovers; `InfoSection.jsx` supersedes them by combining about/hours/location in one frame.

## Styling

All styles are in one global stylesheet, `src/App.css` (no CSS modules). Box frames are drawn with absolutely positioned `.frame-corners` spans (`tl/tr/bl/br`) plus `║ … ║` around headings — reuse that pattern for new framed panels. The responsive breakpoint is `max-width: 968px`.

## Design rules

- Amber CRT palette: `#ffb000` primary, `#cc8800` accents, `#0a0a0a` background.
- Every frame in an ASCII animation set must have exactly the same line count and width, or the layout jumps.
- The scanline effect goes only on h1/h2 headings, never on containers (on containers it made the whole page twitch).
- Use box-drawing characters (`╔ ╗ ╚ ╝ ║ ═`) for frames and headings.
- Inside the site, use a monospace terminal style. Neon (the Monoton font) is only for the entry gate/logo.
- All animations must respect `prefers-reduced-motion`.

## Repo quirks

- The file named `package` (no extension) at the root is a stale older copy of `package.json` (React 18 / Vite 5) and is not used by npm.
