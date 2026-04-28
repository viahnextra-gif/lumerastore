/**
 * Scanner de runtime que verifica artefatos públicos (sitemap.xml, robots.txt e
 * a própria home) atrás de referências às marcas legadas.
 *
 * O domínio publicado `lojawakai.lovable.app` é considerado parte da identidade
 * técnica e não conta como ocorrência.
 */
const FORBIDDEN = [/wakai/i, /meca\s*store/i, /mecastore/i];
const DOMAIN_ALLOWLIST = /lojawakai\.lovable\.app/g;

export interface LegacyHit {
  source: string;
  /** URL ou caminho do recurso onde o termo foi encontrado, se aplicável */
  sourceUrl?: string;
  /** Linha aproximada (1-indexed) dentro do recurso, se aplicável */
  line?: number;
  match: string;
  context: string;
}

function findHits(
  source: string,
  text: string,
  sourceUrl?: string,
): LegacyHit[] {
  const cleaned = text.replace(DOMAIN_ALLOWLIST, ' ');
  const hits: LegacyHit[] = [];
  for (const re of FORBIDDEN) {
    const matches = cleaned.matchAll(new RegExp(re.source, re.flags + 'g'));
    for (const m of matches) {
      const idx = m.index ?? 0;
      const context = cleaned
        .slice(Math.max(0, idx - 60), idx + 60)
        .replace(/\s+/g, ' ')
        .trim();
      // Approximate line by counting newlines in the original (uncleaned) text
      // up to the position. Falls back to undefined when text has no newlines.
      let line: number | undefined;
      if (text.includes('\n')) {
        line = text.slice(0, idx).split('\n').length;
      }
      hits.push({ source, sourceUrl, line, match: m[0], context });
    }
  }
  return hits;
}

async function fetchText(url: string): Promise<string> {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return '';
    return await r.text();
  } catch {
    return '';
  }
}

export async function scanLegacyBrandReferences(): Promise<LegacyHit[]> {
  const hits: LegacyHit[] = [];

  // 1. Static public artifacts
  const [sitemap, robots] = await Promise.all([
    fetchText('/sitemap.xml'),
    fetchText('/robots.txt'),
  ]);
  hits.push(...findHits('sitemap.xml', sitemap, '/sitemap.xml'));
  hits.push(...findHits('robots.txt', robots, '/robots.txt'));

  // 2. Current DOM (head + body text + meta content)
  if (typeof document !== 'undefined') {
    const headHtml = document.head?.outerHTML ?? '';
    hits.push(...findHits('document.head', headHtml));

    const bodyText = document.body?.innerText ?? '';
    hits.push(...findHits('document.body', bodyText));
  }

  return hits;
}
