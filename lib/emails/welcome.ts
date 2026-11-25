// E-mail de acesso. De propósito simples: texto curto, um único link, sem senha no corpo
// e sem truques de marketing, para os provedores tratarem como mensagem pessoal e não como spam.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type WelcomeData = { nome: string; link: string; mentor: string };

export function welcomeEmail(data: WelcomeData) {
  const v = { nome: esc(data.nome), link: esc(data.link), mentor: esc(data.mentor) };
  const font = "font-family:Arial,Helvetica,sans-serif;";
  return {
    subject: `${data.nome}, seu acesso ao Compromisso`,
    text: [
      `Olá, ${data.nome}!`,
      '',
      `Aqui é ${data.mentor}. Criei o seu espaço no Compromisso, onde vamos acompanhar juntos a sua evolução no LinkedIn.`,
      '',
      'Para entrar, abra o link abaixo e crie a sua senha:',
      data.link,
      '',
      'O link vale por 7 dias e só pode ser usado uma vez. Se ele expirar, é só me pedir outro.',
      '',
      'Um pouco por dia, todo dia. Conte comigo!',
      data.mentor,
    ].join('\n'),
    html: `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Seu acesso ao Compromisso</title></head>
<body style="margin:0;padding:0;background:#f6f1eb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1eb;">
<tr><td align="center" style="padding:28px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e6dcd1;border-radius:8px;">
    <tr><td style="padding:28px 28px 8px;${font}font-size:20px;font-weight:bold;color:#1a120d;">compromisso<span style="color:#c9530a;">.</span></td></tr>
    <tr><td style="padding:8px 28px 0;${font}font-size:17px;line-height:1.6;color:#3d2e24;">
      <p style="margin:0 0 14px;">Olá, ${v.nome}!</p>
      <p style="margin:0 0 14px;">Aqui é ${v.mentor}. Criei o seu espaço no Compromisso, onde vamos acompanhar juntos a sua evolução no LinkedIn.</p>
      <p style="margin:0 0 20px;">Para entrar, toque no botão e crie a sua senha:</p>
    </td></tr>
    <tr><td style="padding:0 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#c9530a;border-radius:8px;">
        <a href="${v.link}" style="display:inline-block;padding:14px 26px;${font}font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;">Criar minha senha e entrar</a>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:20px 28px 28px;${font}font-size:15px;line-height:1.6;color:#6b5f55;">
      <p style="margin:0 0 14px;">Se o botão não abrir, copie este endereço no navegador:<br><a href="${v.link}" style="color:#a8440a;word-break:break-all;">${v.link}</a></p>
      <p style="margin:0 0 14px;">O link vale por 7 dias e só pode ser usado uma vez. Se ele expirar, é só me pedir outro.</p>
      <p style="margin:0;font-size:17px;color:#3d2e24;">Um pouco por dia, todo dia. Conte comigo!<br><strong>${v.mentor}</strong></p>
    </td></tr>
  </table>
  <p style="margin:16px 0 0;${font}font-size:12px;color:#8a7d72;">Neogen · Consultoria LinkedIn Estratégico</p>
</td></tr>
</table>
</body>
</html>`,
  };
}
