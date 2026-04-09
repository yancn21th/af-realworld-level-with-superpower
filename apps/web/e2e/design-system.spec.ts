import { test, expect } from '@playwright/test';

test.describe('Header design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header is sticky and has white background', async ({ page }) => {
    const header = page.getByTestId('header');
    await expect(header).toBeVisible();
    const styles = await header.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { position: cs.position, background: cs.backgroundColor };
    });
    expect(styles.position).toBe('sticky');
    expect(styles.background).toBe('rgb(255, 255, 255)');
  });

  test('nav links use DM Sans font', async ({ page }) => {
    const nav = page.locator('header nav a, header nav button').first();
    const fontFamily = await nav.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('dm sans');
  });

  test('nav link active state uses pill border-radius', async ({ page }) => {
    // The Home link should be active on /
    const homeLink = page.locator('header nav a[href="/"]').first();
    const radius = await homeLink.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    const parsed = parseInt(radius);
    expect(parsed).toBeGreaterThanOrEqual(100);
  });

  test('logo uses Outfit (display) font', async ({ page }) => {
    const logo = page.locator('header a').first();
    const fontFamily = await logo.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('outfit');
  });
});

test.describe('Footer design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('footer has dark background #181e25', async ({ page }) => {
    const footer = page.getByTestId('footer');
    await expect(footer).toBeVisible();
    const bg = await footer.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).toBe('rgb(24, 30, 37)');
  });

  test('footer links are white-on-dark', async ({ page }) => {
    const footerLink = page.locator('[data-testid="footer"] a').first();
    const color = await footerLink.evaluate(el =>
      window.getComputedStyle(el).color
    );
    // Should be light (white-ish) color
    const r = parseInt(color.match(/\d+/g)?.[0] ?? '0');
    expect(r).toBeGreaterThan(150);
  });
});

test.describe('Visual snapshots — layout', () => {
  test('header snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('header')).toBeVisible();
    await expect(page.getByTestId('header')).toHaveScreenshot('header.png');
  });

  test('footer snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('footer')).toBeVisible();
    await expect(page.getByTestId('footer')).toHaveScreenshot('footer.png');
  });
});
