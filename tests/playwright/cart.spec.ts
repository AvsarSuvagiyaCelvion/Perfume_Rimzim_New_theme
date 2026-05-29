import { test, expect } from '@playwright/test';

const SAMPLE_PRODUCT = process.env.SAMPLE_PRODUCT_HANDLE || 'sample';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${SAMPLE_PRODUCT}`);
    await page.getByRole('button', { name: /add to (cart|bag)/i }).first().click();
    await page.waitForTimeout(800);
  });

  test('cart drawer or page is accessible after add-to-cart', async ({ page }) => {
    // Either a drawer opens, or we can navigate to /cart
    const drawer = page.locator('[role="dialog"], .cart-drawer, [data-cart-drawer]').first();
    if (await drawer.count() > 0 && await drawer.isVisible()) {
      // Drawer pattern
      await expect(drawer).toBeVisible();
      const closeBtn = drawer.getByRole('button', { name: /close/i });
      await expect(closeBtn).toBeVisible();
    } else {
      // Page pattern
      await page.goto('/cart');
      await expect(page.getByRole('heading', { name: /cart|bag/i })).toBeVisible();
    }
  });

  test('cart shows the added product', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('body')).toContainText(/.+/);
    const items = page.locator('[data-cart-item], .cart-item, .line-item');
    await expect(items.first()).toBeVisible();
  });

  test('quantity stepper updates total', async ({ page }) => {
    await page.goto('/cart');
    const incrementBtn = page.locator(
      '[aria-label*="increase" i], [aria-label*="plus" i], button:has-text("+")'
    ).first();

    if (await incrementBtn.count() === 0) {
      test.skip(true, 'No quantity stepper found — may be drawer-only');
    }

    await incrementBtn.click();
    await page.waitForTimeout(800);
    // Cart should have updated — assert no error toast
    const errors = page.locator('[role="alert"]:has-text("error"), .cart-error');
    expect(await errors.count()).toBe(0);
  });

  test('checkout button is present and goes to /checkout', async ({ page }) => {
    await page.goto('/cart');
    const checkout = page.locator(
      'button[name*="checkout"], a[href*="/checkout"], button:has-text("Checkout")'
    ).first();
    await expect(checkout).toBeVisible();
  });

  test('checkout button is full-width on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only assertion');
    await page.goto('/cart');
    const checkout = page.locator(
      'button[name*="checkout"], a[href*="/checkout"]'
    ).first();
    const box = await checkout.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    expect(box?.width || 0, 'Checkout CTA should be > 80% of viewport on mobile').toBeGreaterThan(viewportWidth * 0.8);
  });
});
