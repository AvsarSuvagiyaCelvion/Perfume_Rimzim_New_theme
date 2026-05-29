import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    expect(errors, `Console errors:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('hero CTA is visible and clickable', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    const cta = page.getByRole('link', { name: /shop|explore|view|discover/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /.+/);
  });

  test('main navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    // First tabbable should be a skip link, then main nav
    expect(['A', 'BUTTON']).toContain(focused);
  });

  test('has Organization JSON-LD', async ({ page }) => {
    await page.goto('/');
    const orgSchema = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      return scripts
        .map(s => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
        .filter(Boolean)
        .find((s: any) => s['@type'] === 'Organization');
    });
    expect(orgSchema).toBeTruthy();
    expect((orgSchema as any).name).toBeTruthy();
    expect((orgSchema as any).url).toBeTruthy();
  });
});
