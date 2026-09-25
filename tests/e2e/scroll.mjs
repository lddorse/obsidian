import { run, dismissGate, check, wait } from './lib.mjs';
const NOON = '2026-09-24T12:00:00-05:00';

// Per section: its top/bottom in page coords, plus where its content starts/ends
const layout = page => page.evaluate(() => [...document.querySelectorAll('.snap-section')].map(s => {
  const kids = [...s.children].map(c => c.getBoundingClientRect());
  const r = s.getBoundingClientRect();
  return { id: s.id, top: r.top + scrollY, bottom: r.bottom + scrollY,
    contentTop: Math.min(...kids.map(k => k.top)) + scrollY, contentBottom: Math.max(...kids.map(k => k.bottom)) + scrollY };
}));

// Is scrollY a valid resting place: a section top, or anywhere inside a tall section?
const validRest = (y, secs, vh) => secs.some(s => Math.abs(y - s.top) <= 2 || (s.bottom - s.top > vh && y >= s.top - 2 && y <= s.bottom - vh + 2));

// Interactive elements in view must sit fully inside the frame's inner edge
const frameClear = page => page.evaluate(() => {
  const f = document.querySelector('.viewport-frame').getBoundingClientRect();
  const b = 2, inner = { top: f.top + b, left: f.left + b, right: f.right - b, bottom: f.bottom - b };
  return [...document.querySelectorAll('main a, main button')].filter(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight) return false;
    return r.top < inner.top || r.left < inner.left || r.right > inner.right || r.bottom > inner.bottom;
  }).map(el => el.textContent.trim().slice(0, 20));
});

// Drive `step` until the page stops moving; record which content edges were seen
const traverse = async (page, step, vh, settle) => {
  const secs = await layout(page);
  const seen = Object.fromEntries(secs.map(s => [s.id, { top: false, bottom: false }]));
  const bad = [], covered = [];
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => scrollY);
    for (const s of secs) {
      if (s.contentTop >= y - 1 && s.contentTop < y + vh) seen[s.id].top = true;
      if (s.contentBottom <= y + vh + 1 && s.contentBottom > y) seen[s.id].bottom = true;
    }
    if (!validRest(y, secs, vh)) bad.push(Math.round(y));
    covered.push(...(await frameClear(page)));
    if (y === last) break;
    last = y;
    await step(y, secs);
    await wait(settle);
  }
  const unreached = Object.entries(seen).filter(([, v]) => !v.top || !v.bottom).map(([id, v]) => `${id}(${!v.top ? 'top' : ''}${!v.bottom ? 'bottom' : ''})`);
  return { unreached, bad, covered: [...new Set(covered)] };
};

const toTop = page => page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
// Exact maximum: asking for more than that gets snapped back to the last section's top
const toBottom = page => page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight - innerHeight, behavior: 'instant' }));

run(async ({ openPage }) => {
  for (const [w, h] of [[390, 700], [1280, 800]]) {
    console.log(`--- ${w}x${h}`);
    // Wheel (normal motion)
    { const { context, page, errors } = await openPage({ width: w, height: h, time: NOON });
      await dismissGate(page); await wait(500);
      await page.mouse.move(w / 2, h / 2);
      // Flick-sized steps between sections (a tiny nudge is snapped straight
      // back, as it should be); small steps while inside a tall section, the
      // way someone reads through one
      const insideTall = (y, secs, dir) => secs.some(s => s.bottom - s.top > h + 2 &&
        (dir > 0 ? y >= s.top - 2 && y < s.bottom - h - 2 : y > s.top + 2 && y <= s.bottom - h + 2));
      for (const [dir, sign] of [['down', 1], ['up', -1]]) {
        const r = await traverse(page, (y, secs) => page.mouse.wheel(0, sign * (insideTall(y, secs, sign) ? 60 : h * 0.6)), h, 700);
        check(`wheel ${dir}: all content reachable`, !r.unreached.length, r.unreached.join(' '));
        check(`wheel ${dir}: always rests on a snap position`, !r.bad.length, r.bad.join(','));
        check(`wheel ${dir}: frame never over links/buttons`, !r.covered.length, r.covered.join(' | '));
      }
      check('no console errors', !errors.length, errors.join(' | '));
      await context.close(); }

    // Keyboard (instant, via reduced motion) — arrows and page keys, both ways
    { const { context, page } = await openPage({ width: w, height: h, reduced: true, time: NOON });
      await dismissGate(page);
      for (const [key, start] of [['ArrowDown', toTop], ['PageDown', toTop], ['ArrowUp', toBottom], ['PageUp', toBottom]]) {
        await start(page); await wait(100);
        const r = await traverse(page, () => page.keyboard.press(key), h, 120);
        check(`${key}: all content reachable`, !r.unreached.length, r.unreached.join(' '));
        check(`${key}: always rests on a snap position`, !r.bad.length, r.bad.join(','));
      }
      await toTop(page); await wait(100);
      const secs = await layout(page);
      await page.keyboard.press('ArrowDown'); await wait(100);
      check('ArrowDown from hero lands on coffee top', Math.abs(await page.evaluate(() => scrollY) - secs[1].top) <= 1);
      await page.evaluate(() => window.addEventListener('keydown', e => { window.__prevented = e.defaultPrevented; }));
      await page.keyboard.press('Alt+ArrowDown');
      check('modified arrows are left to the browser', (await page.evaluate(() => window.__prevented)) === false);
      await context.close(); }

    // Jump links, reduced motion: instant, focus moves to the section
    { const { context, page } = await openPage({ width: w, height: h, reduced: true, time: NOON });
      await dismissGate(page);
      const secs = await layout(page);
      for (const s of secs.slice(1)) {
        await toTop(page); await wait(50);
        await page.locator(`.jump-links a[href="#${s.id}"]`).click();
        const y = await page.evaluate(() => scrollY);
        const focus = await page.evaluate(() => document.activeElement?.id);
        check(`jump #${s.id}: instant, focused`, Math.abs(y - s.top) <= 1 && focus === s.id, `y=${Math.round(y)} want ${Math.round(s.top)} focus=${focus}`);
      }
      await context.close(); }

    // Jump link and arrow key, normal motion: smooth, then arrives
    { const { context, page } = await openPage({ width: w, height: h, time: NOON });
      await dismissGate(page); await wait(300);
      const secs = await layout(page);
      const target = secs.find(s => s.id === 'about');
      await page.locator('.jump-links a[href="#about"]').click();
      const early = await page.evaluate(() => scrollY); await wait(1200);
      const final = await page.evaluate(() => scrollY);
      check('jump link scrolls smoothly', early < target.top - 5 && Math.abs(final - target.top) <= 1, `early=${Math.round(early)} final=${Math.round(final)}`);
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await wait(1500);
      const loc = secs.find(s => s.id === 'location');
      const after = await page.evaluate(() => scrollY);
      check('quick double ArrowDown stacks (smooth)', after >= loc.top - 1 && validRest(after, secs, h), `y=${Math.round(after)} location=${Math.round(loc.top)}`);
      await context.close(); }

    // Modal: snapping and page scroll off, keys ignored, focus handling
    { const { context, page } = await openPage({ width: w, height: h, reduced: true, time: NOON });
      await dismissGate(page);
      await page.locator('.jump-links a[href="#cocktails"]').click();
      const y0 = await page.evaluate(() => scrollY);
      const btn = page.locator('#cocktails .menu-item').first();
      await btn.focus(); await page.keyboard.press('Enter'); await wait(100);
      const st = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { open: !!document.querySelector('.modal-content'), cls: document.documentElement.classList.contains('scroll-locked'), snap: cs.scrollSnapType, overflow: cs.overflowY, focus: document.activeElement?.className }; });
      check('Enter on menu item opens modal', st.open);
      check('modal: snapping off, scroll locked', st.cls && st.snap === 'none' && st.overflow === 'hidden', JSON.stringify(st));
      check('modal: close button focused', st.focus === 'modal-close');
      await page.mouse.move(w / 2, 40); await page.mouse.wheel(0, 400); await page.keyboard.press('PageDown'); await wait(300);
      check('modal: page does not move', Math.abs(await page.evaluate(() => scrollY) - y0) <= 1);
      await page.keyboard.press('Escape'); await wait(150);
      const after = await page.evaluate(() => ({ cls: document.documentElement.classList.contains('scroll-locked'), snap: getComputedStyle(document.documentElement).scrollSnapType, y: scrollY, focus: document.activeElement?.textContent }));
      check('modal closed: snapping back, position kept', !after.cls && after.snap.includes('mandatory') && Math.abs(after.y - y0) <= 1, JSON.stringify(after));
      check('modal closed: focus back on menu item', after.focus?.startsWith('Old Fashioned'), after.focus);
      await context.close(); }
  }

  // Hours rows stay on one line; narrow screens show the short day label
  for (const w of [320, 390, 1280]) {
    const { context, page } = await openPage({ width: w, height: 800, reduced: true, time: NOON });
    await dismissGate(page);
    const rows = await page.$$eval('.hours-item', els => els.map(e => Math.round(e.getBoundingClientRect().height)));
    check(`${w}px: hours rows on one line`, rows.every(h => h < 30), rows.join(','));
    // What's painted: the visually hidden full name has a 1px box
    const shown = await page.$$eval('.hours-item:first-child .day-long, .hours-item:first-child .day-short',
      els => els.filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent));
    const want = w < 480 ? 'Mon - Thu' : 'Monday - Thursday';
    check(`${w}px: shows "${want}"`, shown.length === 1 && shown[0] === want, shown.join(' + '));
    const a11y = await page.locator('.hours-list').ariaSnapshot();
    check(`${w}px: screen readers get "Monday - Thursday" only`, a11y.includes('Monday - Thursday') && !a11y.includes('Mon - Thu'), a11y.split('\n')[0]);
    await context.close();
  }

  // Hero status follows the clock
  { const { context, page } = await openPage({ time: '2026-09-24T21:59:30-05:00', install: true });
    const before = await page.locator('.hero-status').innerText();
    await page.clock.runFor(35000); await wait(200);
    const after = await page.locator('.hero-status').innerText();
    check('hero status updates at the minute', before === '> OPEN UNTIL 10 PM' && after === '> OPENS TOMORROW 7 AM', `${before} -> ${after}`);
    await context.close(); }

});
