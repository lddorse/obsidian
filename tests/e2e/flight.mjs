import { run, check, wait } from './lib.mjs';
const rect = (page, sel) => page.evaluate(sel => { const r = document.querySelector(sel)?.getBoundingClientRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }, sel);
const near = (a, b, tol) => a && b && Math.abs(a.x - b.x) <= tol && Math.abs(a.y - b.y) <= tol && Math.abs(a.w - b.w) <= tol;

run(async ({ openPage }) => {
  for (const [w, h, when, label] of [[1280, 800, '2026-09-24T12:00:00-05:00', 'open'], [390, 700, '2026-09-24T23:00:00-05:00', 'closed']]) {
    const { context, page, errors } = await openPage({ width: w, height: h, time: when });
    await page.locator('.gate-sign.is-ready').waitFor({ state: 'attached' });
    await wait(300); // dismiss mid-flicker
    const hero = await rect(page, '.hero-sign');
    const t0 = Date.now();
    await page.keyboard.press('Escape');
    const early = await page.evaluate(() => ({
      flying: !!document.querySelector('.entry-gate.is-flying'),
      heroHidden: getComputedStyle(document.querySelector('.hero-sign')).visibility === 'hidden',
      flicker: getComputedStyle(document.querySelector('.entry-gate .neon-letter')).animationName
    }));
    check(`${label} ${w}px: flight starts, hero sign hidden, flicker stopped`, early.flying && early.heroHidden && early.flicker === 'none', JSON.stringify(early));
    // Freeze the flight just before the end to compare positions
    await page.evaluate(() => { const a = document.querySelector('.gate-sign').getAnimations()[0]; a.pause(); a.currentTime = 250; });
    await page.evaluate(() => { const a = document.querySelector('.gate-sign').getAnimations()[0]; a.currentTime = 499; });
    const end = await rect(page, '.gate-sign');
    check(`${label} ${w}px: sign lands on the hero sign`, near(end, hero, 2), `end=${JSON.stringify(end)} hero=${JSON.stringify(hero)}`);
    await page.evaluate(() => document.querySelector('.gate-sign').getAnimations()[0].play());
    await page.waitForFunction(() => !document.querySelector('.entry-gate'));
    const after = await page.evaluate(() => ({ vis: getComputedStyle(document.querySelector('.hero-sign')).visibility, locked: document.documentElement.classList.contains('scroll-locked') }));
    check(`${label} ${w}px: gate gone, hero sign shown, scroll unlocked`, after.vis === 'visible' && !after.locked, JSON.stringify(after));
    check(`${label} ${w}px: hero sign did not move`, near(await rect(page, '.hero-sign'), hero, 0.5));
    check(`${label} ${w}px: no console errors`, !errors.length, errors.join(' | '));
    await context.close();
  }

  // Unpaused timing: about 500ms from key press to gate gone
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00' });
    await page.locator('.gate-sign.is-ready').waitFor({ state: 'attached' });
    const ms = await page.evaluate(() => new Promise(resolve => {
      const t = performance.now();
      new MutationObserver((_, o) => { if (!document.querySelector('.entry-gate')) { o.disconnect(); resolve(Math.round(performance.now() - t)); } }).observe(document.body, { childList: true, subtree: true });
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }));
    check('flight takes ~500ms', ms >= 480 && ms <= 650, `${ms}ms`);
    await context.close(); }

  // The gate's status line is gone before its background starts fading, so it
  // never overlaps the hero (alley callout) showing through
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00' });
    await page.locator('.gate-sign.is-ready').waitFor({ state: 'attached' });
    const frames = await page.evaluate(() => new Promise(resolve => {
      const gate = document.querySelector('.entry-gate');
      const status = gate.querySelector('.gate-status');
      const out = [];
      const t0 = performance.now();
      const sample = () => {
        if (!document.contains(gate)) return resolve(out);
        out.push({ t: Math.round(performance.now() - t0), status: +getComputedStyle(status).opacity, bg: +getComputedStyle(gate, '::before').opacity });
        requestAnimationFrame(sample);
      };
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      requestAnimationFrame(sample);
    }));
    const overlap = frames.filter(f => f.status > 0.05 && f.bg < 0.95);
    check('flight: status gone before background fades', frames.length > 10 && !overlap.length, overlap.map(f => `${f.t}ms s=${f.status.toFixed(2)} bg=${f.bg.toFixed(2)}`).join(' '));
    const gone = frames.find(f => f.status <= 0.05);
    check('flight: status faded within ~120ms', gone && gone.t <= 130, gone && `${gone.t}ms`);
    await context.close(); }

  // Hero not on screen (deep link): plain fade instead
  { const { context, page } = await openPage({ width: 390, height: 700, time: '2026-09-24T12:00:00-05:00', hash: '#location' });
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('Escape');
    const mode = await page.evaluate(() => document.querySelector('.entry-gate')?.className);
    await page.waitForFunction(() => !document.querySelector('.entry-gate'));
    const finalY = await page.evaluate(() => scrollY);
    const locTop = await page.evaluate(() => document.getElementById('location').getBoundingClientRect().top + scrollY);
    console.log(`     (#location load: scrollY while gate up = ${y}, after = ${finalY}, location top = ${locTop})`);
    check('#location: hero off screen -> fade, not flight', y > 0 ? mode.includes('is-leaving') : mode.includes('is-flying'), mode);
    check('#location: ends at the location section', Math.abs(finalY - locTop) <= 2, `${finalY} vs ${locTop}`);
    await context.close(); }

  // Reduced motion: no flight, instant
  { const { context, page } = await openPage({ reduced: true, time: '2026-09-24T12:00:00-05:00' });
    await page.keyboard.press('Escape');
    const st = await page.evaluate(() => ({ gate: !!document.querySelector('.entry-gate'), vis: getComputedStyle(document.querySelector('.hero-sign')).visibility }));
    check('reduced motion: gate gone at once, hero sign shown', !st.gate && st.vis === 'visible', JSON.stringify(st));
    await context.close(); }

});
