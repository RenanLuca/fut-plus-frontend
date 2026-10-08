import { test, expect } from '@playwright/test';

test.describe('Rotas protegidas (deslogado)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('redireciona para o login ao abrir /home sem sessão', async ({ page }) => {
    await page.goto('/home');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('convite deslogado vai para o login e volta para o convite depois de entrar', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!;
    const password = process.env.E2E_USER_PASSWORD!;

    await page.goto('/invite/convite-inexistente');

    await expect(page).toHaveURL(/\/\?redirect=%2Finvite%2Fconvite-inexistente/);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/invite/convite-inexistente');
    await expect(page.getByRole('heading', { name: 'Convite inválido' })).toBeVisible();
  });
});

test.describe('Sessão (logado)', () => {
  test('mantém a sessão depois de recarregar a página', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/);

    await page.reload();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
  });

  test('sair limpa a sessão e bloqueia as rotas protegidas', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/groups');
    await expect(page).toHaveURL('/');
  });
});
