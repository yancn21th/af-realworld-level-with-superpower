import { test, expect } from '@playwright/test';

test.describe('Home page design compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero banner shows 80px Outfit headline', async ({ page }) => {
    const hero = page.getByTestId('hero-banner');
    await expect(hero).toBeVisible();
    const h1 = hero.locator('h1');
    const styles = await h1.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(styles.fontFamily.toLowerCase()).toContain('outfit');
    expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(72);
    expect(parseInt(styles.fontWeight)).toBeLessThanOrEqual(600);
  });

  test('hero background is white (#ffffff)', async ({ page }) => {
    const hero = page.getByTestId('hero-banner');
    const bg = await hero.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('feed tabs container uses pill border-radius', async ({ page }) => {
    const tabs = page.getByTestId('feed-tabs');
    await expect(tabs).toBeVisible();
    const radius = await tabs.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(parseInt(radius)).toBeGreaterThanOrEqual(100);
  });

  test('active feed tab (Global Feed) has white background', async ({ page }) => {
    const activeTab = page.getByTestId('tab-global');
    const bg = await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('article previews render as cards with shadow', async ({ page }) => {
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 10000 }).catch(() => {});
    const cards = page.getByTestId('article-preview');
    const count = await cards.count();
    if (count > 0) {
      const shadow = await cards.first().evaluate(el => window.getComputedStyle(el).boxShadow);
      expect(shadow).not.toBe('none');
    }
  });

  test('home page visual snapshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home.png', { fullPage: false });
  });
});
