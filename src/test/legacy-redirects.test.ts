import { describe, it, expect } from 'vitest';

/**
 * Garante que rotas legadas em espanhol (criadas antes da migração para PT-BR)
 * continuam redirecionando para suas equivalentes atuais.
 *
 * Como o app usa BrowserRouter + <Navigate replace />, validamos a tabela de
 * redirecionamento declarada em src/App.tsx — qualquer remoção acidental
 * quebrará este teste.
 */
const LEGACY_REDIRECTS: Array<[from: string, to: string]> = [
  ['/cuenta', '/conta'],
  ['/mayorista', '/atacado'],
];

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const appSource = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');

describe('legacy route redirects', () => {
  for (const [from, to] of LEGACY_REDIRECTS) {
    it(`redirects ${from} → ${to}`, () => {
      const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `path=["']${escapedFrom}["'][^>]*<Navigate\\s+to=["']${to}["']\\s+replace`,
        's',
      );
      expect(appSource).toMatch(pattern);
    });
  }

  it('keeps /sobre as a primary (non-redirected) route', () => {
    expect(appSource).toMatch(/path=["']\/sobre["']\s+element={<Sobre/);
  });

  it('keeps /conta as a primary (non-redirected) route', () => {
    expect(appSource).toMatch(/path=["']\/conta["']\s+element={<Account/);
  });

  it('keeps /atacado as a primary (non-redirected) route', () => {
    expect(appSource).toMatch(/path=["']\/atacado["']\s+element={<Wholesale/);
  });
});
