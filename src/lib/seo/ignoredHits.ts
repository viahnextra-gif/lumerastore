/**
 * Persistência local (localStorage) de hits da auditoria de marca legada
 * marcados como "ignorar" pelo admin. Identificamos um hit pela combinação
 * (source, match, contexto truncado) para evitar duplicatas.
 */
import type { LegacyHit } from './legacyBrandScanner';

const KEY = 'lumera.seo.ignoredHits.v1';

export function hitKey(h: Pick<LegacyHit, 'source' | 'match' | 'context'>): string {
  return `${h.source}|${h.match.toLowerCase()}|${h.context.slice(0, 80)}`;
}

export function loadIgnored(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function saveIgnored(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore quota errors
  }
}

export function toggleIgnored(h: LegacyHit, set: Set<string>): Set<string> {
  const next = new Set(set);
  const k = hitKey(h);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  saveIgnored(next);
  return next;
}
