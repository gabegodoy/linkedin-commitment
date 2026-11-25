/** Só os dígitos nacionais (DDD + número), sem o 55. */
export function phoneDigits(raw: string | null | undefined) {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  return d.slice(0, 11);
}

/** (48) 99999-0000 ou (48) 3333-0000, formatando enquanto digita. */
export function maskPhone(raw: string | null | undefined) {
  const d = phoneDigits(raw);
  if (d.length <= 2) return d.length ? '(' + d : '';
  const ddd = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  if (rest.length <= 4) return ddd + rest;
  const cut = rest.length === 9 ? 5 : 4;
  return ddd + rest.slice(0, cut) + '-' + rest.slice(cut);
}

export function phoneIsValid(raw: string) {
  const n = phoneDigits(raw).length;
  return n === 0 || n === 10 || n === 11;
}

/** Aceita o link inteiro colado ou só o final; devolve o que vem depois de /in/. */
export function linkedinSlug(raw: string | null | undefined) {
  let s = (raw ?? '').trim();
  const m = /linkedin\.com\/in\/([^/?#\s]+)/i.exec(s);
  if (m) s = m[1];
  else s = s.replace(/^https?:\/\//i, '').replace(/^(www\.)?linkedin\.com\/?/i, '').replace(/^in\//i, '');
  try {
    s = decodeURIComponent(s);
  } catch {}
  return s.replace(/[^\p{L}\p{N}\-_.]/gu, '').slice(0, 100);
}

export function linkedinUrl(slug: string) {
  return slug ? `https://www.linkedin.com/in/${encodeURIComponent(slug)}/` : null;
}

/** Aceita @usuario, link do GitHub ou só o nome. */
export function githubUser(raw: string | null | undefined) {
  return (raw ?? '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 39);
}

export function cleanEmail(raw: string) {
  return raw.replace(/\s/g, '').toLowerCase();
}

/** Completa https:// quando a pessoa cola um link sem o começo. */
export function completeUrl(raw: string) {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
}
