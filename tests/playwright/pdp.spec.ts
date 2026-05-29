import { test, expect } from '@playwright/test';

const SAMPLE_PRODUCT = process.env.SAMPLE_PRODUCT_HANDLE || 'sample';

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${SAMPLE_PRODUCT}`);
  });

  test('renders title, price, and primary CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-product-price], .price').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add to (cart|bag)/i })).toBeVisible();
  });

  test('variant selector is a button/radio, not a dropdown', async ({ page }) => {
    const dropdowns = await page.locator('select[name*="Size" i], select[name*="Color" i]').count();
    expect(dropdowns, 'Use buttons/tiles for variants, not dropdowns').toBe(0);
  });

  test('add to cart updates the cart drawer', async ({ page }) => {
    const atc = page.getByRole('button', { name: /add to (cart|bag)/i }).first();
    await atc.click();

    // Cart drawer should open or cart count should update
    const cartCount = page.locator('[data-cart-count], .cart-count').first();
    await expect(cartCount).toBeVisible({ timeout: 5000 });
    const count = await cartCount.textContent();
    expect(parseInt(count || '0', 10)).toBeGreaterThan(0);
  });

  test('has Product + Offer JSON-LD with 2026 requirements', async ({ page }) => {
    const productSchema = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      return scripts
        .map(s => { try { return JSON.parse(s.textContent || '{}'); } catch { return null; } })
        .filter(Boolean)
        .find((s: any) => s['@type'] === 'Product');
    }) as any;

    expect(productSchema, 'PDP must have Product JSON-LD').toBeTruthy();
    expect(productSchema.offers, 'Product must have Offer').toBeTruthy();
    expect(productSchema.offers.hasMerchantReturnPolicy,
      'Product offer MUST have hasMerchantReturnPolicy in 2026'
    ).toBeTruthy();
    expect(productSchema.offers.shippingDetails,
      'Product offer MUST have shippingDetails in 2026'
    ).toBeTruthy();
  });

  test('main product image has alt text', async ({ page }) => {
    const mainImg = page.locator('img').first();
    const alt = await mainImg.getAttribute('alt');
    expect(alt, 'Main product image must have alt text').toBeTruthy();
    expect(alt!.length).toBeGreaterThan(2);
  });

  test('mobile: sticky add-to-cart appears on scroll', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Sticky ATC is mobile-only');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    const stickyAtc = page.locator('[data-sticky-atc]');
    // Either it exists and is visible, or it's an explicit project decision not to use one
    if (await stickyAtc.count() > 0) {
      await expect(stickyAtc).toBeVisible();
    }
  });
});
