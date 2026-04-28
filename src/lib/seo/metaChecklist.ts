import type { RouteMetaPreview } from './routePreviews';

/**
 * Regras de validação de meta tags por rota. Retorna uma lista de findings
 * (severity + mensagem) para cada problema encontrado em title/description/OG.
 *
 * Faixas recomendadas (Google/Bing 2024):
 *  - title: 30..60 chars
 *  - description: 50..160 chars
 *  - og:image presente e absoluto
 */
export type Severity = 'ok' | 'warning' | 'error';

export interface Finding {
  field: 'title' | 'description' | 'ogImage' | 'canonical' | 'jsonLd';
  severity: Severity;
  message: string;
  actual?: string | number;
}

export interface RouteCheck {
  path: string;
  label: string;
  findings: Finding[];
  worst: Severity;
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

function rank(s: Severity): number {
  return s === 'error' ? 2 : s === 'warning' ? 1 : 0;
}

export function checkRoute(p: RouteMetaPreview): RouteCheck {
  const findings: Finding[] = [];

  // title
  const titleLen = p.title.trim().length;
  if (!p.title.trim()) {
    findings.push({ field: 'title', severity: 'error', message: 'title vazio' });
  } else if (titleLen < TITLE_MIN) {
    findings.push({
      field: 'title',
      severity: 'warning',
      message: `title curto (${titleLen} chars, recomendado ≥ ${TITLE_MIN})`,
      actual: titleLen,
    });
  } else if (titleLen > TITLE_MAX) {
    findings.push({
      field: 'title',
      severity: 'warning',
      message: `title longo (${titleLen} chars, recomendado ≤ ${TITLE_MAX})`,
      actual: titleLen,
    });
  }

  // description
  const descLen = p.description.trim().length;
  if (!p.description.trim()) {
    findings.push({ field: 'description', severity: 'error', message: 'description vazia' });
  } else if (descLen < DESC_MIN) {
    findings.push({
      field: 'description',
      severity: 'warning',
      message: `description curta (${descLen} chars, recomendado ≥ ${DESC_MIN})`,
      actual: descLen,
    });
  } else if (descLen > DESC_MAX) {
    findings.push({
      field: 'description',
      severity: 'warning',
      message: `description longa (${descLen} chars, recomendado ≤ ${DESC_MAX})`,
      actual: descLen,
    });
  }

  // og image
  if (!p.ogImage) {
    findings.push({ field: 'ogImage', severity: 'error', message: 'og:image ausente' });
  } else if (!/^https?:\/\//i.test(p.ogImage)) {
    findings.push({
      field: 'ogImage',
      severity: 'warning',
      message: 'og:image deve ser uma URL absoluta',
      actual: p.ogImage,
    });
  }

  // canonical
  if (!p.canonical || !/^https?:\/\//i.test(p.canonical)) {
    findings.push({
      field: 'canonical',
      severity: 'error',
      message: 'canonical ausente ou não absoluto',
    });
  }

  // json-ld
  if (p.jsonLdTypes.length === 0) {
    findings.push({
      field: 'jsonLd',
      severity: 'warning',
      message: 'nenhum schema JSON-LD declarado',
    });
  }

  const worst: Severity =
    findings.length === 0
      ? 'ok'
      : findings.reduce<Severity>(
          (acc, f) => (rank(f.severity) > rank(acc) ? f.severity : acc),
          'ok',
        );

  return { path: p.path, label: p.label, findings, worst };
}

export interface ChecklistSummary {
  total: number;
  ok: number;
  warnings: number;
  errors: number;
}

export function summarize(checks: RouteCheck[]): ChecklistSummary {
  return {
    total: checks.length,
    ok: checks.filter((c) => c.worst === 'ok').length,
    warnings: checks.filter((c) => c.worst === 'warning').length,
    errors: checks.filter((c) => c.worst === 'error').length,
  };
}
