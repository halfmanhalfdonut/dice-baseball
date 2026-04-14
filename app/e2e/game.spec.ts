import { test, expect } from '@playwright/test';

test.describe('Dice Baseball Smoke Tests', () => {

  test('splash page loads with Play Ball button', async ({ page }) => {
    await page.goto('/');
    // Should default to splash page
    const shell = page.locator('app-shell');
    await expect(shell).toBeAttached();

    // Play Ball button inside splash-page shadow DOM
    const playBtn = page.locator('.play-btn');
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveText('Play Ball');
  });

  test('navigation from splash to game', async ({ page }) => {
    await page.goto('/');
    const playBtn = page.locator('.play-btn');
    await playBtn.click();
    await expect(page).toHaveURL(/#game/);
  });

  test('run a game and see box score', async ({ page }) => {
    await page.goto('/#game');

    const runBtn = page.locator('.btn-run');
    await expect(runBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.locator('game-runner input').first();
    await seedInput.fill('42');

    await runBtn.click();

    const scoreline = page.locator('.scoreline');
    await expect(scoreline).toBeVisible({ timeout: 10000 });

    const boxScores = page.locator('box-score');
    await expect(boxScores).toHaveCount(2);

    const awayTable = boxScores.first().locator('table tbody tr');
    expect(await awayTable.count()).toBeGreaterThan(0);
  });

  test('deterministic: same seed produces same result', async ({ page }) => {
    await page.goto('/#game');

    const runBtn = page.locator('.btn-run');
    await expect(runBtn).toBeVisible({ timeout: 10000 });

    const seedInput = page.locator('game-runner input').first();

    await seedInput.fill('12345');
    await runBtn.click();
    const scoreline = page.locator('.scoreline');
    await expect(scoreline).toBeVisible({ timeout: 10000 });
    const score1 = await scoreline.textContent();

    // Re-fill the same seed (it auto-advances after each run)
    await seedInput.fill('12345');
    await runBtn.click();
    const score2 = await scoreline.textContent();

    expect(score1).toBe(score2);
  });

  test('nav links work', async ({ page }) => {
    await page.goto('/');

    // Navigate to settings
    await page.locator('a[href="#settings"]').click();
    await expect(page).toHaveURL(/#settings/);

    // Navigate to game
    await page.locator('a[href="#game"]').click();
    await expect(page).toHaveURL(/#game/);

    // Navigate home
    await page.locator('a[href="#splash"]').click();
    await expect(page).toHaveURL(/#splash/);
  });

  test('edit lineups collapsible works', async ({ page }) => {
    await page.goto('/#game');
    const details = page.locator('game-runner details');
    const summary = page.locator('game-runner summary');

    // Should be collapsed by default
    await expect(details).not.toHaveAttribute('open', '');

    // Open it
    await summary.click();
    await expect(details).toHaveAttribute('open', '');
  });
});
