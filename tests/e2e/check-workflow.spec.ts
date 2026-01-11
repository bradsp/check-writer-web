import { test, expect } from '@playwright/test';

test.describe('Check Writer E2E', () => {
  test('should load the application successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');

    // Verify the page title contains expected text
    await expect(page).toHaveTitle(/Check Writer/i);

    // Verify main content is loaded
    await expect(page.locator('body')).toContainText(/Check Writer|Pay to the Order/i, { timeout: 10000 });
  });

  test('should have basic form structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that essential form elements exist
    const inputs = await page.locator('input').count();
    expect(inputs).toBeGreaterThan(0);

    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });
});
