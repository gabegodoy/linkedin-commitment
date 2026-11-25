'use client';

import { useId, useState } from 'react';
import { cleanEmail, completeUrl, githubUser, linkedinSlug, maskPhone, phoneIsValid } from '@/lib/mask';

type Base = { label: string; hint?: string; light?: boolean };

function Wrap({ label, hint, light, id, error, children }: Base & { id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field" style={light ? { fontWeight: 400 } : undefined}>
      <label htmlFor={id}>{label}</label>
      {hint && <small id={id + '-h'}>{hint}</small>}
      {children}
      {error && (
        <small className="field-err" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export function PhoneField({ value, onChange, ...base }: Base & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const bad = touched && !phoneIsValid(value);
  return (
    <Wrap {...base} id={id} error={bad ? 'Número incompleto. Use DDD e número: (48) 99999-0000.' : undefined}>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(48) 99999-0000"
        maxLength={15}
        value={value}
        aria-invalid={bad}
        onChange={(e) => onChange(maskPhone(e.target.value))}
        onBlur={() => setTouched(true)}
      />
    </Wrap>
  );
}

/**
 * Enquanto a pessoa digita um link (tem ":" ou "/"), mantém o texto como está;
 * ao colar ou ao sair do campo, reduz ao nome.
 */
function typing(raw: string, toSlug: (v: string) => string) {
  const v = raw.replace(/\s/g, '');
  return /[:/]/.test(v) ? v.slice(0, 200) : toSlug(v);
}

function Affixed({ prefix, id, ...input }: { prefix: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="affix">
      <span aria-hidden="true">{prefix}</span>
      <input id={id} autoCapitalize="none" autoCorrect="off" spellCheck={false} {...input} />
    </div>
  );
}

export function LinkedinField({ value, onChange, ...base }: Base & { value: string; onChange: (slug: string) => void }) {
  const id = useId();
  return (
    <Wrap {...base} id={id}>
      <Affixed prefix="linkedin.com/in/" id={id} value={value} placeholder="seu-nome" inputMode="url" onChange={(e) => onChange(typing(e.target.value, linkedinSlug))}
        onPaste={(e) => {
          e.preventDefault();
          onChange(linkedinSlug(e.clipboardData.getData('text')));
        }}
        onBlur={() => onChange(linkedinSlug(value))}
      />
    </Wrap>
  );
}

export function GithubField({ value, onChange, ...base }: Base & { value: string; onChange: (user: string) => void }) {
  const id = useId();
  return (
    <Wrap {...base} id={id}>
      <Affixed prefix="github.com/" id={id} value={value} placeholder="seu-usuario" onChange={(e) => onChange(typing(e.target.value, githubUser))}
        onPaste={(e) => {
          e.preventDefault();
          onChange(githubUser(e.clipboardData.getData('text')));
        }}
        onBlur={() => onChange(githubUser(value))}
      />
    </Wrap>
  );
}

export function EmailField({ value, onChange, autoComplete = 'email', ...base }: Base & { value: string; onChange: (v: string) => void; autoComplete?: string }) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const bad = touched && value !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value);
  return (
    <Wrap {...base} id={id} error={bad ? 'Confira o e-mail. Exemplo: nome@gmail.com' : undefined}>
      <input
        id={id}
        type="email"
        inputMode="email"
        required
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="nome@exemplo.com"
        value={value}
        aria-invalid={bad}
        onChange={(e) => onChange(cleanEmail(e.target.value))}
        onBlur={() => setTouched(true)}
      />
    </Wrap>
  );
}

export function PasswordField({
  value,
  onChange,
  autoComplete = 'new-password',
  required = true,
  meter = true,
  startVisible = false,
  ...base
}: Base & { value: string; onChange: (v: string) => void; autoComplete?: string; required?: boolean; meter?: boolean; startVisible?: boolean }) {
  const id = useId();
  const [show, setShow] = useState(startVisible);
  const left = 8 - value.length;
  return (
    <Wrap {...base} id={id}>
      <div className="affix end">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          required={required}
          minLength={meter ? 8 : undefined}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
        />
        <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? 'Esconder a senha' : 'Mostrar a senha'}>
          {show ? 'Esconder' : 'Mostrar'}
        </button>
      </div>
      {meter && value !== '' && <small className={left > 0 ? 'field-err' : 'field-ok'}>{left > 0 ? `Faltam ${left} ${left === 1 ? 'caractere' : 'caracteres'}.` : '✓ Senha com tamanho suficiente.'}</small>}
    </Wrap>
  );
}

export function UrlField({ value, onChange, placeholder, required, ...base }: Base & { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  const id = useId();
  return (
    <Wrap {...base} id={id}>
      <input
        id={id}
        type="url"
        inputMode="url"
        required={required}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
        onBlur={() => onChange(completeUrl(value))}
      />
    </Wrap>
  );
}

export function Stepper({ label, value, onChange, min = 0, max = 20 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? Math.round(n) : min));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <small>{label}</small>
      <div>
        <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label={`Diminuir ${label}`}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
