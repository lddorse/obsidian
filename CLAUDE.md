# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page React 19 + Vite site for "Obsidian", a coffee roastery / cocktail bar, styled as an amber CRT terminal with ASCII art. Plain JSX (no TypeScript), no router, no state library, no linter. Tests are plain Node scripts (no test framework), with Playwright for the browser suites.

## Commands

- `npm run dev` — dev server at `localhost:5173`, not reachable from other devices
- `npm run dev:lan` — same, but on all network interfaces (`vite --host`) so a phone on the same Wi-Fi can open the network URL it prints. Use it only while testing on a device, since it exposes the dev server to everyone on the network.
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built output
- `npm test` — runs every suite below in order and stops at the first failure
- `npm run test:status` — `scripts/test-business-status.mjs` checks the open/closed helper at edge times, including a hypothetical 02:00 close. It loads source through Vite's `ssrLoadModule` because the app's imports have no file extensions. Try it with a different `TZ=` to confirm the visitor's zone doesn't matter.
- `npm run test:gate` / `test:flight` / `test:scroll` — browser suites in `tests/e2e/`:
  - `gate`: the entry gate (a11y, dismissal, flicker, status)
  - `flight`: the sign flight into the hero, including the fade fallback and reduced motion
  - `scroll`: every section reachable by wheel and keys at 390×700 and 1280×800, snap positions, the frame never over links, jump links, the modal lock, and the hours rows
  - Each suite builds the site into `node_modules/.cache/e2e-dist`, serves it with `vite preview` on a free port, and pins the clock with `page.clock`, so results don't depend on the real time. Shared setup is in `tests/e2e/lib.mjs`. A suite exits 1 on any failed check.
  - One-time browser install (Playwright is a devDependency, but its browser isn't downloaded by `npm install`): `npx playwright install chromium`. On a fresh Linux machine, `npx playwright install --with-deps chromium` also installs the system libraries (needs sudo). After upgrading the `playwright` package, run the install again, because each version expects its own browser build.

## Architecture

Content is data-driven: nearly all copy lives in `src/data/`, and components are thin renderers.

- `src/data/menuData.js` — array of menu sections (`id`, `title`, `animation`, `items[]` with `name`, `price`, `description`, `notes`). `App.jsx` maps each to a full-screen `MenuSection` (ASCII art above the menu) and a hero jump link, using `id` as the section's anchor. Adding a section here adds both.
- `src/data/animations.js` — ASCII animations keyed by name (`coffee`, `cocktail`, `beer`, `snacks`), each `{ frames: [...template strings], speed: ms, stillFrame: index }`. `stillFrame` is the frame shown when `prefers-reduced-motion` is on — pick the most representative one (e.g. the full beer glass), not blindly frame 0. A menu section's `animation` field must match one of these keys or `AnimatedAsciiArt` will crash. Frames are raw template literals: whitespace is significant, and backslashes must be escaped (`\\`). The exported `animations` goes through `normalizeFrames`, which strips any blank rows or columns shared by every frame and pads each frame with spaces to the set's max line count and width. Sizes are made uniform in code, so don't hand-pad frames or offset `.animation-wrapper` in CSS to center the art.
- `src/data/businessInfo.js` — `timeZone` (`America/Chicago`), `hours` and `locationInfo`. Each hours row is `{ day, shortDay?, days, open, close }` with `days` as weekday numbers (0 = Sunday) and times as 24h `"HH:MM"`. The displayed `time` string ("7:00 AM - 12:00 AM") is generated from `open`/`close`, so never hand-write it. A `close` at or before `open` means closing after midnight on the next day (Friday `07:00`–`00:00`). `shortDay` ("Mon - Thu") replaces `day` below 480px so the row stays on one line. The full name stays available to screen readers, and the smallest phones (<360px) also get smaller hours text.
- `src/utils/businessStatus.js` — `getBusinessStatus(now?, { schedule?, timeZone? })` → `{ isOpen, closesAt, opensAt }`, computed in the bar's time zone via `Intl`, never the visitor's. It checks the previous day's after-midnight hours too, including Saturday night spilling into Sunday. Status times are compact (`closesAt` "10 PM", "9:30 PM"; `formatOpensAt` gives "7 AM" / "TOMORROW 8 AM" / "MON 7 AM"), while the hours list keeps the full "7:00 AM" form. Reuse this helper anywhere the site needs open/closed status. Holiday and special closures aren't supported yet: the schedule is purely weekly.

### Page layout: full-screen snap sections

`App` renders seven `.snap-section`s in order: `hero`, the four menu sections (`coffee`, `cocktails`, `beer`, `snacks`), `about` (About + Hours) and `location`. Each is `min-height: 100svh` with `scroll-snap-align: start`, and `html` has `scroll-snap-type: y mandatory`.
- **Sections grow instead of clipping.** A section taller than the screen (Location at 390×700) stays reachable, because browsers let you scroll freely through an oversized snap section. Don't give sections a fixed height or `overflow: hidden`.
- **`html` is the scroll container.** Never set `overflow` on `html` or `body` in CSS. Scroll locking uses `useScrollLock` (`src/hooks/useScrollLock.js`), which adds `html.scroll-locked` (overflow hidden and snapping off). The gate and the modal both use it, and locks are counted.
- **Smooth scrolling** (`scroll-behavior: smooth`) applies only under `prefers-reduced-motion: no-preference`, so jumps are instant with reduced motion.
- **Keyboard:** `useSectionKeys` makes ↑/↓/PgUp/PgDn move between sections. A tall section is scrolled through first, and moving up into a tall section lands on its bottom. It's off while the gate or modal is open, ignores modified keys, and stacks repeated presses during a smooth scroll.
- **Jump links** in the hero are plain `#id` anchors. Sections have `tabIndex={-1}` so focus follows the jump.
- **Deep links** (`/#location`): the browser looks for the target before React renders it, so `App` scrolls there in a layout effect, behind the gate.
- **Viewport frame:** the fixed amber `.viewport-frame` sits at `--inset-*` (frame gap plus `env(safe-area-inset-*)`, which needs `viewport-fit=cover` in `index.html`) and has `pointer-events: none`. Section padding is inset + border + `--content-gap`, so at rest content never sits under it. Keep new sections on `.snap-section` padding rather than their own.

### Entry gate and hero

- **Gate:** `App` renders `EntryGate` over the page on every load and makes `<main>` `inert` while it's up. When open, the sign flickers on letter by letter every time. There's no session or storage logic.
- **Font wait:** the gate's sign waits (≤1s) for Monoton to load before appearing.
- **Lit/unlit:** this is each letter's resting style, and the flicker only plays on top. So the global reduced-motion rule leaves the sign lit or unlit with no extra JS.
- **Focus** goes to the dialog, not the "tap to enter" button, so the button stays faint until tabbed to.
- **Shared sign:** both signs are `NeonSign` (`src/components/NeonSign.jsx`).
- **Flight:** on dismiss, the gate's sign flies into the hero's sign over `FLIGHT_MS` (500ms), a Web Animations transform from its own rect to the hero sign's rect. The flicker stops. The status line and button fade out in the first 100ms, and only then does the gate background fade (400ms), so the gate's text never overlaps the hero showing through. Keep those CSS timings in step with `FLIGHT_MS`.
  - The hero sign stays `visibility: hidden` until the gate unmounts. Its size (`.hero-sign`) is what the flight scales to.
  - If the hero sign isn't fully on screen (a deep link or restored scroll), the gate just fades. Under reduced motion it disappears instantly.
- **Status:** `App` owns one `useBusinessStatus()` (it recomputes each minute) and passes it to both the gate and the hero, so they can't disagree.

### Menu items and modal

- **Menu items** are `<button>`s. Clicking one sets `App`'s `selectedItem`, which opens `Modal` (a `role="dialog"`). It closes on Esc, an overlay click, or ✕.
- **Focus:** opening moves focus to ✕, and closing returns it to the item.
- **While the modal is open,** scrolling and snapping are locked and section keys are off.

### iPhone checks (Safari can't be tested here)

Run through these on a real iPhone after changing layout, scrolling or locking:
- **Tall sections:** swipe through each section, especially Location, and About at small widths. Every line should be reachable, and snapping shouldn't jump past the bottom of a tall section or trap you in it.
- **Modal scroll lock:** open a menu item, then try to scroll or swipe the page behind it. It must not move or re-snap. When you close it, you should be back where you were, still snapping.
- **Address bar:** scroll so the address bar collapses and expands. Sections (`100svh`) shouldn't jump or re-snap to the wrong section, and the frame and content should stay clear of the notch and home indicator in portrait and landscape.

`src/hooks/usePrefersReducedMotion.js` tracks the OS setting live (`matchMedia` change listener). Use it for any JS-driven motion. CSS animations are already covered by the `prefers-reduced-motion` block at the end of `App.css`, which must stay last.

## Styling

All styles are in one global stylesheet, `src/App.css` (no CSS modules). Framed panels use `Frame` (`src/components/Frame.jsx`), which adds the absolutely positioned `.frame-corners` spans (`╔ ╗ ╚ ╝`); headings get `║ … ║`. The breakpoint at 700px widens the frame gap and section padding, and 600px tightens the info frames.

## Design rules

- Amber CRT palette: `#ffb000` primary, `#cc8800` accents, `#0a0a0a` background.
- Every frame in an ASCII animation set must have exactly the same line count and width, or the layout jumps (`normalizeFrames` in `animations.js` enforces this).
- The scanline effect goes only on h1/h2 headings, never on containers (on containers it made the whole page twitch).
- Use box-drawing characters (`╔ ╗ ╚ ╝ ║ ═`) for frames and headings.
- Inside the site, use a monospace terminal style. Neon (the Monoton font, loaded from Google Fonts in `index.html`) is only for the entry gate/logo.
- All animations must respect `prefers-reduced-motion`.

## Repo quirks

- The file named `package` (no extension) at the root is a stale older copy of `package.json` (React 18 / Vite 5) and is not used by npm.
