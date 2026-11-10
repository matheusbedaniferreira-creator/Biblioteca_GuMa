// A API e acessada pelo mesmo dominio do Vite: /api e encaminhado ao Laravel.
// NENHUM token, senha ou perfil e guardado em localStorage/sessionStorage.
const BASE = '/api';
let csrfToken = null; // Somente em memoria; nao e credencial de usuario.

async function getCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${BASE}/auth/csrf`, {
    credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Nao foi possivel iniciar a sessao segura. Confira a API Laravel.');
  const data = await response.json();
  csrfToken = data.csrf_token;
  return csrfToken;
}
export function resetCsrf() { csrfToken = null; }

export async function api(path, { method = 'GET', body, signal } = {}) {
  const write = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  let response;
  try {
    const csrf = write ? await getCsrf() : null;
    response = await fetch(`${BASE}${path}`, {
      method, signal, credentials: 'same-origin', cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 419 && write) {
      resetCsrf();
      throw new Error('Sessao de seguranca expirada. Atualize a pagina e tente novamente.');
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error(error?.message || 'API indisponivel. Inicie os containers com docker compose up --build.');
  }
  const data = await response.json().catch(() => ({}));
  if (['/auth/login', '/auth/register', '/auth/logout'].includes(path)) resetCsrf();
  if (!response.ok) {
    const validation = data.errors && Object.values(data.errors).flat().join(' ');
    throw new Error(validation || data.message || `Erro HTTP ${response.status}`);
  }
  return data;
}

export const localDate = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR') : '—';
export const dateTime = value => value ? new Date(value).toLocaleDateString('pt-BR') : '—';
export const statusText = {
  PENDENTE: 'Aguardando analise', APROVADA: 'Retirada confirmada',
  RECUSADA: 'Recusada', CANCELADA: 'Cancelada',
  EMPRESTADO: 'Emprestado', DEVOLVIDO: 'Devolvido',
};
