import { test, expect } from '@playwright/test';

test('画像が切り替わる', async ({ page }) => {
  await page.goto('/index.html');

  await page.click('#start');
  await page.waitForTimeout(50);

  const img1 = await page.locator('canvas').screenshot();

  await page.waitForTimeout(1000);

  const img2 = await page.locator('canvas').screenshot();

  expect(img1).not.toEqual(img2);
});
