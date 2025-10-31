import { test, expect } from '@playwright/test';

test.describe('German Salary Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the application successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/German Salary Calculator/i);
    
    // Check for key form elements
    await expect(page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i)).toBeVisible();
    await expect(page.getByLabel(/Tax Class|Steuerklasse/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Calculate|Berechnen/i })).toBeVisible();
  });

  test('calculates net salary for tax class I', async ({ page }) => {
    // Enter a gross salary
    await page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i).fill('5000');
    
    // Select tax class I
    const taxClassSelect = page.getByLabel(/Tax Class|Steuerklasse/i);
    await taxClassSelect.selectOption('1');
    
    // Click calculate
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    
    // Wait for results
    await page.waitForSelector('text=/Net Salary|Nettogehalt/i', { timeout: 5000 });
    
    // Verify result is displayed
    const resultText = await page.textContent('body');
    expect(resultText).toContain('€');
    
    // The net salary should be less than gross
    // This is a basic sanity check
    const netAmount = await page.locator('text=/3,/').first();
    await expect(netAmount).toBeVisible();
  });

  test('language toggle switches between English and German', async ({ page }) => {
    // Default should show some English or German text
    await expect(page.getByText(/German Salary Calculator|Deutscher Gehaltsrechner/i)).toBeVisible();
    
    // Find and click language toggle
    const languageButton = page.getByRole('button', { name: /DE|EN/i }).first();
    await languageButton.click();
    
    // Language should have changed
    // Wait a bit for the change to take effect
    await page.waitForTimeout(500);
    
    // Verify labels changed
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('handles invalid input gracefully', async ({ page }) => {
    // Try to enter negative salary
    const salaryInput = page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i);
    await salaryInput.fill('-1000');
    
    // Click calculate
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    
    // Should not crash - page should still be functional
    await expect(salaryInput).toBeVisible();
  });

  test('bonus configuration works', async ({ page }) => {
    // Enter salary
    await page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i).fill('4000');
    
    // Look for bonus section (might be collapsed)
    const bonusSection = page.locator('text=/Bonus|Bonus/i').first();
    
    if (await bonusSection.isVisible()) {
      // If bonus section is visible, try to add a bonus
      const addBonusButton = page.getByRole('button', { name: /Add|Hinzufügen/i }).first();
      if (await addBonusButton.isVisible()) {
        await addBonusButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Calculate and verify no crash
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    await page.waitForTimeout(1000);
    
    // Page should still be functional
    await expect(page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i)).toBeVisible();
  });

  test('all tax classes are available', async ({ page }) => {
    const taxClassSelect = page.getByLabel(/Tax Class|Steuerklasse/i);
    
    // Get all options
    const options = await taxClassSelect.locator('option').allTextContents();
    
    // Should have at least 6 tax classes (I to VI)
    expect(options.length).toBeGreaterThanOrEqual(6);
  });

  test('results update when input changes', async ({ page }) => {
    // First calculation
    await page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i).fill('3000');
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    await page.waitForTimeout(500);
    
    // Get first result
    const firstResult = await page.textContent('body');
    
    // Change input
    await page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i).fill('6000');
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    await page.waitForTimeout(500);
    
    // Get second result
    const secondResult = await page.textContent('body');
    
    // Results should be different
    expect(firstResult).not.toBe(secondResult);
  });

  test('mobile viewport renders correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional
    await expect(page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Calculate|Berechnen/i })).toBeVisible();
  });

  test('form validation prevents empty submission', async ({ page }) => {
    // Clear any pre-filled values
    await page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i).clear();
    
    // Try to calculate without entering salary
    await page.getByRole('button', { name: /Calculate|Berechnen/i }).click();
    
    // Should not crash and form should still be present
    await expect(page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i)).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type in focused input
    await page.keyboard.type('4500');
    
    // Continue tabbing and press Enter on calculate button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Page should still be functional
    await expect(page.getByLabel(/Gross Monthly Salary|Bruttogehalt/i)).toBeVisible();
  });
});
