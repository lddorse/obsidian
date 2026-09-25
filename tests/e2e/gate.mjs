import { run, check, wait } from './lib.mjs';

run(async ({ openPage }) => {
  const status = page => page.locator('.gate-status').innerText();

  // Open, Thu 12:00 CDT
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00' });
    const d = page.locator('.entry-gate');
    await page.locator('.gate-sign.is-ready').waitFor({ state: 'attached' });
    check('flickers on load', await page.locator('.entry-gate .neon-letter').nth(3).evaluate(e => getComputedStyle(e).animationName) === 'neon-on-alt');
    check('dialog attrs', await d.getAttribute('role') === 'dialog' && await d.getAttribute('aria-modal') === 'true' && !!(await d.getAttribute('aria-label')));
    check('h1 aria-label', await page.locator('.gate-sign').getAttribute('aria-label') === 'Obsidian');
    check('letters aria-hidden', (await page.locator('.entry-gate .neon-letter[aria-hidden="true"]').count()) === 8);
    check('status open', (await status(page)).startsWith('OPEN'), await status(page));
    check('dialog focused on open', await page.evaluate(() => document.activeElement?.classList.contains('entry-gate')));
    check('button faint before tabbing', await page.locator('.gate-enter').evaluate(e => getComputedStyle(e).opacity) === '0.5');
    await page.keyboard.press('Tab');
    check('Tab reaches button', await page.evaluate(() => document.activeElement?.className === 'gate-enter'));
    await page.keyboard.press('Tab');
    check('Tab stays inside gate', await page.evaluate(() => !document.querySelector('main').contains(document.activeElement)));
    await page.locator('.entry-gate').focus();
    check('site inert', await page.evaluate(() => document.querySelector('main').inert));
    check('page scroll locked', await page.evaluate(() => document.documentElement.classList.contains('scroll-locked')));
    const snap = await page.locator('.entry-gate').ariaSnapshot();
    check('screen reader sees dialog, heading, button',
      snap.includes('dialog "Welcome to Obsidian"') && snap.includes('heading "Obsidian" [level=1]') && snap.includes('button "tap to enter"'), snap);
    await page.keyboard.press('Escape'); await wait(600);
    check('Esc dismisses', await page.locator('.entry-gate').count() === 0);
    check('site no longer inert', await page.evaluate(() => !document.querySelector('main').inert && !document.documentElement.classList.contains('scroll-locked')));
    await page.reload();
    // The page's load event can fire before React has rendered the gate
    await page.waitForFunction(() => document.activeElement?.classList.contains('entry-gate'));
    await page.locator('.gate-sign.is-ready').waitFor({ state: 'attached' });
    const again = await page.locator('.entry-gate .neon-letter').nth(3).evaluate(e => getComputedStyle(e).animationName);
    check('shown again on reload, flickers again', again === 'neon-on-alt', again);
    check('nothing written to sessionStorage', await page.evaluate(() => sessionStorage.length === 0));
    await context.close(); }

  // Closed, Thu 23:00 CDT
  { const { context, page } = await openPage({ time: '2026-09-24T23:00:00-05:00' });
    check('status closed', (await status(page)) === 'CLOSED // OPENS TOMORROW 7 AM _', await status(page));
    const c = await page.locator('.entry-gate .neon-letter').first().evaluate(e => [getComputedStyle(e).color, getComputedStyle(e).animationName].join(' / '));
    check('unlit, no flicker', c.includes('0.16') && c.endsWith('none'), c);
    await page.mouse.click(100, 100); await wait(600);
    check('backdrop click dismisses', await page.locator('.entry-gate').count() === 0);
    await context.close(); }

  // Reduced motion, open
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00', reduced: true });
    await wait(100);
    const c = await page.locator('.entry-gate .neon-letter').nth(3).evaluate(e => [getComputedStyle(e).color, getComputedStyle(e).animationName, getComputedStyle(e.parentElement).visibility].join(' / '));
    check('reduced motion: lit immediately, no animation', c === 'rgb(255, 176, 0) / none / visible', c);
    await page.keyboard.press(' ');
    check('Space dismisses instantly under reduced motion', await page.locator('.entry-gate').count() === 0);
    await context.close(); }

  // Button click + Enter
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00' });
    await page.locator('.gate-enter').click(); await wait(600);
    check('button click dismisses', await page.locator('.entry-gate').count() === 0);
    await context.close(); }
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00' });
    await page.keyboard.press('Enter'); await wait(600);
    check('Enter dismisses', await page.locator('.entry-gate').count() === 0);
    await context.close(); }

  // Lingering at 6:59 AM Monday flips to OPEN
  { const { context, page } = await openPage({ time: '2026-09-28T06:59:30-05:00', install: true });
    await wait(300);
    const before = await status(page);
    await page.clock.runFor(35000); await wait(200);
    const after = await status(page);
    check('status updates at the minute', before.startsWith('CLOSED') && after.startsWith('OPEN'), `${before} -> ${after}`);
    await context.close(); }

  // Phone width
  { const { context, page } = await openPage({ time: '2026-09-24T12:00:00-05:00', width: 390 });
    await wait(3000);
    const fit = await page.evaluate(() => [document.querySelector('.gate-sign').scrollWidth, innerWidth, document.documentElement.scrollWidth]);
    check('sign fits at 390px, no horizontal scroll', fit[0] <= fit[1] - 32 && fit[2] <= fit[1], fit.join(' '));
    await context.close(); }

});
