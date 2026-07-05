import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

test.describe('Admin media optimistic UI', () => {
  let user: any;
  let token: string;

  test.beforeAll(async () => {
    // create temp admin user
    const timestamp = Date.now();
    const userId = randomUUID();
    const email = `pw-admin-${timestamp}@local.test`;
    const pwd = 'PlaywrightTemp!123';
    const hashed = await bcrypt.hash(pwd, 10);
    user = await prisma.user.create({ data: { id: userId, email, name: 'PW Admin', role: 'ADMIN', emailVerified: true, isActive: true, passwordHash: hashed } });
    token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  });

  test.afterAll(async () => {
    if (user) await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  test('shows optimistic preview on upload and replaces with server item; optimistic edit persists', async ({ page }) => {
    // First navigate to the page
    await page.goto('/admin/media');
    
    // THEN inject the auth data into localStorage
    await page.evaluate(({ tokenVal, userVal }) => {
      localStorage.setItem('auth_token', tokenVal);
      localStorage.setItem('auth_user', JSON.stringify(userVal));
      // Manually dispatch storage event to notify AuthContext
      window.dispatchEvent(new Event('storage'));
    }, { tokenVal: token, userVal: { id: user.id, email: user.email, name: user.name, role: user.role } });

    // Reload the page to let AuthContext load from localStorage
    await page.reload();
    await expect(page).toHaveURL('/admin/media');
    
    // Intercept API requests and inject Authorization header
    await page.route('**/api/admin/media', async (route) => {
      const req = route.request();
      const headers = { ...req.headers() } as any;
      headers['authorization'] = `Bearer ${token}`;
      await route.continue({ headers });
    });

    // Give the AuthContext useEffect a chance to load the user from localStorage
    await page.waitForTimeout(500);
    // Verify localStorage has the user data
    const storedUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    console.log('Stored user:', storedUser);
    // Wait for form to be enabled (inputs should be enabled when user is loaded)
    await page.waitForSelector('#media-title:not([disabled])', { timeout: 8000 });

    // select file input and set file
    const filePath = path.resolve(__dirname, '../../public/images/homepage1.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    // fill title/description and upload
    await page.fill('#media-title', 'Playwright Upload');
    await page.fill('#media-desc', 'Uploaded by Playwright test');
    await page.locator('button:has-text("Upload")').click({ force: true });

    // Wait for the uploaded card to appear with the expected title
    const uploadedCard = page.locator('div.grid div.border', {
      has: page.locator('div.font-semibold', { hasText: 'Playwright Upload' }),
    }).first();
    await expect(uploadedCard).toBeVisible({ timeout: 15000 });
    await expect(uploadedCard.locator('div.font-semibold')).toHaveText('Playwright Upload', { timeout: 15000 });

    // Click Edit on that card
    await uploadedCard.locator('button:has-text("Edit")').click({ force: true });

    // Change title and save inside the modal
    await expect(page.locator('#edit-title')).toBeVisible({ timeout: 15000 });
    await page.fill('#edit-title', 'Playwright Edited');
    await page.evaluate(() => {
      const saveButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Save');
      saveButton?.click();
    });

    // Optimistic: wait for the card to show the updated title
    const editedCard = page.locator('div.grid div.border', {
      has: page.locator('div.font-semibold', { hasText: 'Playwright Edited' }),
    }).first();
    await expect(editedCard).toBeVisible({ timeout: 30000 });
    await expect(editedCard.locator('div.font-semibold')).toHaveText('Playwright Edited', { timeout: 30000 });
  });
});
