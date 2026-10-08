import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

setup('autentica o usuário de teste', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Defina E2E_USER_EMAIL e E2E_USER_PASSWORD em .env.e2e');
  }

  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/home/);

  // O JWT fica no localStorage; o storageState guarda isso para os outros testes.
  await page.context().storageState({ path: AUTH_FILE });
});
