import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = '@fut-plus:token';

// O front interpreta o datetime-local como horário de Brasília (-03:00).
function matchDateInput(hoursFromNow: number): string {
  const future = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  return future
    .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    .replace(' ', 'T')
    .slice(0, 16);
}

async function authHeaders(page: Page) {
  const token = await page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
}

// Limpeza pela API: não deixa lixo no banco mesmo se o teste falhar.
async function removeGroup(page: Page, request: APIRequestContext, groupId: string) {
  await request.delete(`${API_URL}/groups/${groupId}`, { headers: await authHeaders(page) });
}

test('jornada: cria grupo, cria partida, confirma presença e adiciona convidado', async ({ page, request }) => {
  const groupName = `E2E ${Date.now()}`;
  let groupId: string | undefined;

  try {
    await page.goto('/groups');

    // 1. Criar o grupo
    await page.getByRole('button', { name: 'Criar grupo' }).click();
    const groupSheet = page.getByRole('dialog');
    await groupSheet.getByLabel('Nome do grupo').fill(groupName);
    await groupSheet.getByLabel('Dia da semana').click();
    await page.getByRole('option', { name: 'Quarta' }).click();
    await groupSheet.getByLabel('Horário').fill('20:00');
    await groupSheet.getByLabel('Frequência').click();
    await page.getByRole('option', { name: 'Eventual' }).click();
    await groupSheet.getByLabel('Valor por pessoa').fill('20');
    await groupSheet.getByRole('radio', { name: 'Brasileirão' }).click();
    await groupSheet.getByRole('button', { name: 'Criar', exact: true }).click();

    // 2. O grupo aparece na lista e abre o detalhe
    const groupLink = page.getByRole('link', { name: new RegExp(groupName) });
    await expect(groupLink).toBeVisible();
    await groupLink.click();
    await expect(page).toHaveURL(/\/groups\/[\w-]+$/);
    groupId = new URL(page.url()).pathname.split('/').pop();

    // 3. Criar a partida
    await expect(page.getByText('Nenhuma partida marcada')).toBeVisible();
    await page.getByRole('button', { name: 'Criar partida' }).click();
    const matchSheet = page.getByRole('dialog');
    await matchSheet.getByLabel('Data e horário').fill(matchDateInput(2));
    await matchSheet.getByRole('button', { name: 'Criar', exact: true }).click();
    await expect(page.getByText('Partida criada!')).toBeVisible();

    // 4. Confirmar presença e abrir a partida
    await page.getByRole('button', { name: 'Vou', exact: true }).click();
    await page.getByRole('link', { name: 'Ver partida' }).click();
    await expect(page).toHaveURL(/\/groups\/[\w-]+\/matches\/[\w-]+$/);
    await expect(page.getByRole('heading', { name: 'Confirmados (1)' })).toBeVisible();

    // 5. Adicionar um convidado
    await page.getByRole('button', { name: 'Convidado' }).click();
    const guestSheet = page.getByRole('dialog');
    await guestSheet.getByLabel('Nome').fill('Convidado E2E');
    await guestSheet.getByRole('radio', { name: 'Atacante' }).click();
    await guestSheet.getByRole('radio', { name: 'Brasileirão' }).click();
    await guestSheet.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await expect(page.getByText('Convidado adicionado')).toBeVisible();
    await expect(page.getByText('Convidado E2E')).toBeVisible();

    // O convidado já nasce confirmado: dono + convidado = 2 confirmados.
    await expect(page.getByRole('heading', { name: 'Confirmados (2)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pendentes (0)' })).toBeVisible();
  } finally {
    if (groupId) await removeGroup(page, request, groupId);
  }
});

test('gera times com 2 confirmados (dono + convidado)', async ({ page, request }) => {
  // Dados montados pela API: o foco aqui é a geração de times, não o cadastro.
  await page.goto('/home');
  const headers = await authHeaders(page);

  const groupResponse = await request.post(`${API_URL}/groups`, {
    headers,
    data: {
      name: `E2E ${Date.now()}`,
      weekday: 'WEDNESDAY',
      hour: '20:00',
      frequency: 'EVENTUAL',
      valuePerUser: 20,
      rank: 'BRASILEIRAO',
    },
  });
  expect(groupResponse.ok()).toBeTruthy();
  const groupId = (await groupResponse.json()).id as string;

  try {
    const matchResponse = await request.post(`${API_URL}/groups/${groupId}/group-matches`, {
      headers,
      data: { matchDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
    });
    expect(matchResponse.ok()).toBeTruthy();
    const matchId = (await matchResponse.json()).id as string;

    await request.patch(`${API_URL}/groups/${groupId}/group-matches/${matchId}/match-presences`, {
      headers,
      data: { isPresent: true },
    });
    await request.post(`${API_URL}/groups/${groupId}/group-matches/${matchId}/guests`, {
      headers,
      data: { name: 'Convidado E2E', position: 'STRIKER', rank: 'BRASILEIRAO' },
    });

    await page.goto(`/groups/${groupId}/matches/${matchId}`);

    await expect(page.getByRole('heading', { name: 'Confirmados (2)' })).toBeVisible();

    await page.getByRole('button', { name: 'Gerar times' }).click();
    const teamsSheet = page.getByRole('dialog');
    await teamsSheet.getByLabel('Jogadores por time').fill('1');
    await teamsSheet.getByRole('button', { name: 'Gerar', exact: true }).click();

    await expect(page.getByText('Times gerados!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gerar novamente' })).toBeVisible();
  } finally {
    await removeGroup(page, request, groupId);
  }
});
