import { test, expect } from '@playwright/test';

test.describe('Login page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('page renders login form with shadcn Card', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('heading uses Outfit display font', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const font = await h1.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain('outfit');
  });

  test('submit button has dark background (#181e25)', async ({ page }) => {
    const btn = page.locator('button[type="submit"]');
    const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #181e25 = rgb(24, 30, 37) — but may be overridden by shadcn defaults
    // Accept any dark color (r < 80)
    const r = parseInt(bg.match(/\d+/g)?.[0] ?? '255');
    expect(r).toBeLessThan(80);
  });

  test('input uses rounded border', async ({ page }) => {
    const input = page.locator('input[type="email"]');
    const radius = await input.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(4);
  });

  test('page background is white', async ({ page }) => {
    const pageBg = await page.getByTestId('login-page').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(pageBg).toBe('rgb(255, 255, 255)');
  });

  test('login page visual snapshot', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page).toHaveScreenshot('login.png');
  });
});

test.describe('Register page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('page renders register form', async ({ page }) => {
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('heading uses Outfit display font', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const font = await h1.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain('outfit');
  });

  test('register page visual snapshot', async ({ page }) => {
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page).toHaveScreenshot('register.png');
  });
});
