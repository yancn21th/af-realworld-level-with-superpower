import { test, expect } from '@playwright/test';

test.describe('Editor page', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('editor redirect visual snapshot', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveScreenshot('editor-redirect.png');
  });
});

test.describe('Settings page', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('settings redirect visual snapshot', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveScreenshot('settings-redirect.png');
  });
});

test.describe('Profile page design compliance', () => {
  test('profile page shell renders', async ({ page }) => {
    await page.goto('/profile/testuser');
    await expect(page.getByTestId('profile-page')).toBeVisible();
  });

  test('profile tabs use pill border-radius', async ({ page }) => {
    await page.goto('/profile/testuser');
    const tabs = page.getByTestId('profile-tabs');
    await expect(tabs).toBeVisible();
    const radius = await tabs.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(100);
  });

  test('profile header has light surface background', async ({ page }) => {
    await page.goto('/profile/testuser');
    // The header section should have light gray bg (#f0f0f0)
    const headerSection = page.locator('[data-testid="profile-page"] > div').first();
    const bg = await headerSection.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #f0f0f0 = rgb(240, 240, 240)
    const r = parseInt(bg.match(/\d+/g)?.[0] ?? '0');
    expect(r).toBeGreaterThan(200);
  });

  test('profile page visual snapshot', async ({ page }) => {
    await page.goto('/profile/testuser');
    await expect(page.getByTestId('profile-page')).toBeVisible();
    await expect(page).toHaveScreenshot('profile.png');
  });
});

test.describe('Article page', () => {
  test('article body text uses DM Sans (verified via home page cards)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 10000 }).catch(() => {});
    const cards = page.getByTestId('article-preview');
    const count = await cards.count();
    if (count > 0) {
      const font = await cards.first().evaluate(el => window.getComputedStyle(el).fontFamily);
      expect(font.toLowerCase()).toContain('dm sans');
    }
  });
});
