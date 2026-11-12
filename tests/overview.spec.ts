import { test, expect, type Page } from '@playwright/test';

const testEmail = process.env.FLAMELENS_E2E_EMAIL;
const testPassword = process.env.FLAMELENS_E2E_PASSWORD;

async function signIn(page: Page) {
  test.skip(!testEmail || !testPassword, 'Set FLAMELENS_E2E_EMAIL and FLAMELENS_E2E_PASSWORD in a local test environment.');
  await page.fill('input[name="email"]', testEmail!);
  await page.fill('input[name="password"]', testPassword!);
  await page.click('button[type="submit"]');
}

test.describe('FlameLens Overview Dashboard', () => {
  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Understand fire before it becomes a spacecraft emergency');
    await expect(page.locator('text=NASA Microgravity Combustion Intelligence')).toBeVisible();
  });

  test('Sign in redirects to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in\?next=/);
    await expect(page.locator('text=Welcome back to FlameLens')).toBeVisible();
  });

  test('Sign in flow works with credentials', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await signIn(page);
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Mission Control')).toBeVisible();
    await expect(page.locator('text=Investigations Catalogued')).toBeVisible();
  });

  test('Overview shows correct metrics', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('text=16 investigations catalogued')).toBeVisible();
    await expect(page.locator('text=Across 7 local investigations')).toBeVisible();
    await expect(page.locator('text=7 registered')).toBeVisible();
    await expect(page.locator('text=1 external')).toBeVisible();
    await expect(page.locator('text=future project to monitor')).toBeVisible();
  });

  test('Model readiness tracks visible', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('text=Flame Extinction')).toBeVisible();
    await expect(page.locator('text=Flame Spread')).toBeVisible();
    await expect(page.locator('text=Soot / Smoke Point')).toBeVisible();
    await expect(page.locator('text=Smoke Detection')).toBeVisible();
    
    await expect(page.locator('text=Exploratory')).toBeVisible();
    await expect(page.locator('text=Data Audited')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Not Supported')).toBeVisible();
  });

  test('Data quality notices displayed', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('text=Known issues in current evidence')).toBeVisible();
    await expect(page.locator('text=Missing Supervised-Learning Targets')).toBeVisible();
    await expect(page.locator('text=SPICE Table Contains 34 Exact Duplicate Rows')).toBeVisible();
    await expect(page.locator('text=Unresolved Units and Gravity Markers')).toBeVisible();
    await expect(page.locator('text=Incomplete Metadata in Indexed Sources')).toBeVisible();
    await expect(page.locator('text=Unverified Run-to-Source Mappings')).toBeVisible();
    await expect(page.locator('text=Registered and External Sources Not Yet Ingested')).toBeVisible();
  });

  test('Recent activity timeline visible', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('text=Genuine Repository Events')).toBeVisible();
    await expect(page.locator('text=Dataset Audit Completed')).toBeVisible();
    await expect(page.locator('text=SPICE Duplicate Rows Identified')).toBeVisible();
    await expect(page.locator('text=CFI-G Inverse Empty Rows Catalogued')).toBeVisible();
    await expect(page.locator('text=SAFFIRE-I/II/III Metadata Registered')).toBeVisible();
  });

  test('Quick access cards displayed', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('text=Routes to Science Tools')).toBeVisible();
    await expect(page.locator('text=Investigation Explorer')).toBeVisible();
    await expect(page.locator('text=Comparison Lab')).toBeVisible();
    await expect(page.locator('text=Model Lab')).toBeVisible();
    await expect(page.locator('text=Gravity Playground')).toBeVisible();
    await expect(page.locator('text=Research Copilot')).toBeVisible();
  });

  test('Mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('button[aria-label="Open navigation"]')).toBeVisible();
    await page.click('button[aria-label="Open navigation"]');
    await expect(page.locator('.app-sidebar.is-open')).toBeVisible();
  });

  test('Page refresh preserves auth', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Mission Control')).toBeVisible();
  });

  test('Breadcrumbs show correctly', async ({ page }) => {
    await page.goto('/sign-in');
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"] a:has-text("Dashboard")')).toBeVisible();
  });
});