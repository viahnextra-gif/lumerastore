import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Garante que nenhum termo de marca legada apareça em texto visível ao usuário,
 * em respostas geradas pelo bot ou em metadados de SEO.
 *
 * Termos proibidos: Wakai, Meca Store, mecastore.
 *
 * Allowlist (justificada):
 *  - "lojawakai.lovable.app" — domínio publicado real do projeto, usado em
 *    canonical/og:url do SEO. Trocar exigiria republicar em outro slug.
 *  - Linhas que explicitamente instruem o agente a NÃO usar a marca antiga
 *    (instruções negativas dentro dos prompts do system).
 *  - O próprio arquivo deste teste.
 */
const FORBIDDEN = [/wakai/i, /meca\s*store/i, /mecastore/i];

const ROOT = join(__dirname, "..", "..");
const SCAN_DIRS = ["src", "public", "supabase/functions", "index.html"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "__snapshots__"]);
const SCAN_EXT = /\.(ts|tsx|js|jsx|css|html|md|json|xml|txt)$/i;

function* walk(dir: string): Generator<string> {
  const stat = statSync(dir);
  if (stat.isFile()) {
    yield dir;
    return;
  }
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else if (SCAN_EXT.test(entry)) yield full;
  }
}

function isAllowedLine(file: string, line: string): boolean {
  // The test file itself
  if (file.endsWith("no-legacy-brand.test.ts")) return true;

  // Published domain — keep until the project is republished under a new slug.
  // We only allow the literal "lojawakai.lovable.app" reference.
  const stripped = line.replace(/lojawakai\.lovable\.app/g, "");
  if (!FORBIDDEN.some((re) => re.test(stripped))) return true;

  // Negative instructions inside AI prompts (e.g. `NUNCA use "Wakai"`).
  if (/nunca|never|não\s+use|do\s+not\s+use|antig[oa]s?/i.test(line)) {
    return true;
  }

  return false;
}

describe("no-legacy-brand", () => {
  it("does not contain Wakai, Meca Store or mecastore in user-facing or AI strings", () => {
    const offenders: string[] = [];

    for (const target of SCAN_DIRS) {
      const fullTarget = join(ROOT, target);
      try {
        for (const file of walk(fullTarget)) {
          const content = readFileSync(file, "utf8");
          if (!FORBIDDEN.some((re) => re.test(content))) continue;

          const lines = content.split("\n");
          lines.forEach((line, i) => {
            if (FORBIDDEN.some((re) => re.test(line)) && !isAllowedLine(file, line)) {
              offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
            }
          });
        }
      } catch {
        // Target may not exist in some checkouts (e.g. supabase folder optional)
      }
    }

    if (offenders.length > 0) {
      const msg =
        "Encontradas referências à marca antiga (Wakai / Meca Store / mecastore):\n" +
        offenders.slice(0, 50).join("\n");
      throw new Error(msg);
    }
    expect(offenders).toEqual([]);
  });
});
