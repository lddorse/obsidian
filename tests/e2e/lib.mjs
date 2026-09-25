// Shared setup for the browser test suites: builds the site into a cache dir,
// serves it with `vite preview` on a free port, and drives it with Playwright.
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const outDir = 'node_modules/.cache/e2e-dist';

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let failures = 0;
export const check = (label, ok, info = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${info !== '' ? `: ${info}` : ''}`);
};

// Runs a suite: suite({ browser, openPage }) and exits non-zero on any failure
export const run = async (suite) => {
  await build({ root, logLevel: 'error', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root, logLevel: 'error', build: { outDir }, preview: { port: 0, strictPort: false } });
  const url = server.resolvedUrls.local[0];
  const browser = await chromium.launch();

  // A page with the gate up and focused. time pins the clock (install: true
  // lets it run forward with page.clock.runFor).
  const openPage = async ({ width = 1280, height = 800, reduced = false, time, install = false, hash = '' } = {}) => {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    if (time) {
      if (install) await page.clock.install({ time: new Date(time) });
      else await page.clock.setFixedTime(new Date(time));
    }
    await page.goto(url + hash);
    // The page's load event can fire before React has rendered the gate
    await page.waitForFunction(() => document.activeElement?.classList.contains('entry-gate'));
    return { context, page, errors };
  };

  try {
    await suite({ browser, openPage });
  } catch (e) {
    failures++;
    console.error(e);
  } finally {
    await browser.close();
    await server.close();
  }
  console.log(failures ? `${failures} FAILED` : 'all passed');
  process.exit(failures ? 1 : 0);
};

export const dismissGate = async (page) => {
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.entry-gate'));
  await wait(100);
};
