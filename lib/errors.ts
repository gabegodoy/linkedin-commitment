/** Traduz erros do Supabase para frases simples. */
export function friendly(message: string | undefined | null) {
  const m = message ?? '';
  if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sem conexão. Verifique a internet e tente de novo.';
  if (/should be different/i.test(m)) return 'A senha nova precisa ser diferente da atual.';
  if (/at least \d+ characters/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  return m || 'Algo deu errado. Tente de novo.';
}
