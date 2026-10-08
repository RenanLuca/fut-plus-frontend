import { test, expect } from '@playwright/test';

// Estes testes exercitam a tela de login, então começam deslogados.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renderiza o formulário de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Seja bem-vindo!' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('mostra erros de validação com os campos vazios', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Informe o email')).toBeVisible();
    await expect(page.getByText('A senha deve ter no mínimo 6 caracteres')).toBeVisible();
  });

  test('mostra erro para email inválido', async ({ page }) => {
    await page.getByLabel('Email').fill('isso-nao-e-um-email');
    await page.getByLabel('Senha', { exact: true }).fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Email inválido')).toBeVisible();
  });

  test('navega para o cadastro ao clicar em "Cadastre-se"', async ({ page }) => {
    await page.getByRole('link', { name: 'Cadastre-se' }).click();

    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('Login com a API real', () => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  test.skip(!email || !password, 'Defina E2E_USER_EMAIL e E2E_USER_PASSWORD em .env.e2e');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('entra com credenciais válidas e vai para /home', async ({ page }) => {
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Senha', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test('mostra erro com senha incorreta', async ({ page }) => {
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Senha', { exact: true }).fill('SenhaErrada999!');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Email ou senha inválidos')).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
