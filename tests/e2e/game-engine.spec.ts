import { test, expect } from '@playwright/test';
import type { TransparentMode } from '../../src/types/engine';

const modes: TransparentMode[] = ['sab', 'message'];

for (const mode of modes) {
  test(`画像が切り替わる [${mode} mode]`, async ({ page }) => {
    await page.goto(`/index.html?mode=${mode}`);

    await page.click('#start');
    await page.waitForTimeout(50);

    const img1 = await page.locator('canvas').screenshot();

    await page.waitForTimeout(1000);

    const img2 = await page.locator('canvas').screenshot();

    expect(img1).not.toEqual(img2);
  });
}
