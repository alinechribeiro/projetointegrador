const API_URL = 'http://localhost:3001';

export async function api(caminho, metodo = 'GET', corpo) {
  try {
    const resposta = await fetch(API_URL + caminho, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    return { ok: resposta.ok, dados: await resposta.json() };
  } catch {
    return { ok: false, dados: { mensagem: 'Não foi possível conectar ao servidor. O backend está rodando?' } };
  }
}
