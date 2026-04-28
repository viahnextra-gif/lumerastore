import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Garante que rotas legadas em espanhol redirecionam para suas equivalentes
 * atuais em pt-BR.
 *
 * Duas camadas de teste:
 *
 *  1. Estática: lê src/App.tsx e confere que cada par está declarado.
 *  2. Integração: monta um router em memória e simula navegação HTTP real
 *     (via MemoryRouter) — useLocation() deve refletir o destino final após
 *     a resolução do <Navigate replace />.
 *
 * Nota: SPAs com BrowserRouter resolvem redirects no cliente (não 301/302).
 * O fallback do hosting (Lovable) sempre serve index.html para deep links,
 * então a validação client-side é a fonte da verdade para SPAs.
 */
const LEGACY_REDIRECTS: Array<[from: string, to: string]> = [
  ['/cuenta', '/conta'],
  ['/mayorista', '/atacado'],
];

const appSource = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');

describe('legacy route redirects — static declaration', () => {
  for (const [from, to] of LEGACY_REDIRECTS) {
    it(`declares redirect ${from} → ${to}`, () => {
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

/**
 * Mini-router replicando apenas as rotas que importam para os redirects,
 * para testá-los isolados das dependências de auth/i18n do app real.
 */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
}

function MiniApp({ initial }: { initial: string }) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/conta" element={<LocationProbe />} />
        <Route path="/atacado" element={<LocationProbe />} />
        <Route path="/sobre" element={<LocationProbe />} />
        <Route path="/cuenta" element={<Navigate to="/conta" replace />} />
        <Route path="/mayorista" element={<Navigate to="/atacado" replace />} />
        <Route path="*" element={<div data-testid="path">404:{initial}</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('legacy route redirects — runtime navigation', () => {
  for (const [from, to] of LEGACY_REDIRECTS) {
    it(`navigating to ${from} ends at ${to}`, async () => {
      render(<MiniApp initial={from} />);
      await waitFor(() => {
        expect(screen.getByTestId('path').textContent).toBe(to);
      });
    });
  }

  it('non-redirected route /sobre stays at /sobre', async () => {
    render(<MiniApp initial="/sobre" />);
    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/sobre');
    });
  });
});
