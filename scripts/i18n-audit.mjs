#!/usr/bin/env node
/**
 * i18n / pt-BR audit scanner
 *
 * Varre o código (src/, supabase/functions/, public/) procurando:
 *  - Palavras claramente em espanhol (não compartilhadas com pt-BR)
 *  - Termos de moeda/localização incorretos (PYG, ₲, Guaraní, Asunción, Paraguay)
 *  - Tooltips, aria-labels, placeholders e títulos com texto espanhol
 *
 * Gera um relatório em /mnt/documents/i18n-audit-report.md com arquivos,
 * linhas e o trecho exato encontrado para correção manual ou em lote.
 *
 * Uso: node scripts/i18n-audit.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "supabase/functions", "public", "index.html"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".json", ".md", ".txt", ".xml"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);
const IGNORE_FILES = new Set([
  "src/integrations/supabase/types.ts",
  "src/integrations/supabase/client.ts",
]);

// Palavras/expressões em espanhol que NÃO existem em pt-BR (ou mudam de sentido).
// Removidas palavras compartilhadas (compras, ofertas, marca, Cancelar, Enviar, Confirmar, comprar) — geram falsos positivos.
const SPANISH_WORDS = [
  // pronomes / artigos / conjunções marcantes
  "usted", "ustedes", "vosotros",
  // verbos / locuções
  "iniciar sesión", "cerrar sesión", "registrarse", "regístrate", "ingresar", "ingresá",
  "agregar al carrito", "añadir al carrito", "añadir",
  "seleccionar", "seleccioná", "elegí", "elige",
  "guardar", "aceptar", "rechazar", "siguiente", "anterior",
  // substantivos comuns que diferem do PT
  "carrito", "cuenta", "ajustes", "configuración", "configuraciones",
  "categoría", "categorías", "subcategoría", "subcategorías",
  "tienda", "minorista",
  "dirección", "direcciones",
  "teléfono", "correo electrónico", "contraseña",
  "precio", "precios", "cantidad", "descuento",
  "mayorista", "mayoristas",
  "bienvenido", "bienvenida",
  "lo siento", "por favor", "disculpa",
  "ayuda", "preguntas frecuentes",
  "nombre completo", "nombre de empresa",
  // moeda / localização paraguaia
  "guaraní", "guaraníes", "paraguay", "paraguayo", "paraguaya", "asunción", "ciudad del este",
];

// Substrings exatas (case-sensitive) que disparam alerta direto
const RAW_SUBSTRINGS = [
  "₲",
  "PYG",
  "Guaraní",
  "Asunción",
  "Paraguay",
  "¿",
  "¡",
];


// Padrões para extrair apenas strings (literais e JSX text) — reduz falsos positivos
const STRING_LITERAL_RE = /(["'`])((?:\\.|(?!\1).)*?)\1/g;
const JSX_TEXT_RE = />([^<>{}\n]{3,})</g;

function buildWordRegex(words) {
  // Escape e junta com alternância. \b não funciona com acentuados, então usamos
  // lookaround manual para caracteres não-alfabéticos.
  const escaped = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${escaped.join("|")})(?![\\p{L}\\p{N}])`, "giu");
}

const WORD_RE = buildWordRegex(SPANISH_WORDS);

function walk(dir, acc = []) {
  let stat;
  try { stat = fs.statSync(dir); } catch { return acc; }
  if (stat.isFile()) { acc.push(dir); return acc; }
  if (!stat.isDirectory()) return acc;
  const base = path.basename(dir);
  if (IGNORE_DIRS.has(base)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    walk(path.join(dir, entry), acc);
  }
  return acc;
}

function scanFile(file) {
  if (IGNORE_FILES.has(file.replace(/\\/g, "/"))) return [];
  const ext = path.extname(file);
  if (!EXTS.has(ext)) return [];
  let content;
  try { content = fs.readFileSync(file, "utf8"); } catch { return []; }
  const lines = content.split(/\r?\n/);
  const hits = [];

  lines.forEach((line, idx) => {
    // Ignore obvious code-only lines (import, urls)
    const trimmed = line.trim();
    if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) return;

    // Coleta candidatos: strings literais + texto JSX
    const candidates = [];
    let m;
    STRING_LITERAL_RE.lastIndex = 0;
    while ((m = STRING_LITERAL_RE.exec(line)) !== null) {
      const text = m[2];
      if (text.length >= 2) candidates.push(text);
    }
    JSX_TEXT_RE.lastIndex = 0;
    while ((m = JSX_TEXT_RE.exec(line)) !== null) {
      const text = m[1].trim();
      if (text.length >= 3) candidates.push(text);
    }
    // Para HTML/MD/TXT/XML, varrer a linha inteira
    if ([".html", ".md", ".txt", ".xml"].includes(ext)) candidates.push(line);

    for (const text of candidates) {
      const matches = new Set();
      WORD_RE.lastIndex = 0;
      let w;
      while ((w = WORD_RE.exec(text)) !== null) matches.add(w[0]);
      for (const sub of RAW_SUBSTRINGS) {
        if (text.includes(sub)) matches.add(sub);
      }
      if (matches.size > 0) {
        hits.push({
          line: idx + 1,
          snippet: line.trim().slice(0, 200),
          matches: [...matches],
        });
        break; // evita duplicar a mesma linha
      }
    }
  });
  return hits;
}

function main() {
  const files = [];
  for (const r of ROOTS) walk(r, files);

  const report = [];
  let totalHits = 0;
  const byFile = new Map();

  for (const file of files) {
    const hits = scanFile(file);
    if (hits.length) {
      byFile.set(file, hits);
      totalHits += hits.length;
    }
  }

  // Agrupa por diretório raiz
  const grouped = new Map();
  for (const [file, hits] of byFile) {
    const root = file.split(path.sep)[0];
    if (!grouped.has(root)) grouped.set(root, []);
    grouped.get(root).push([file, hits]);
  }

  report.push(`# Relatório de auditoria i18n (pt-BR)`);
  report.push("");
  report.push(`Gerado: ${new Date().toISOString()}`);
  report.push(`Arquivos com alertas: **${byFile.size}**`);
  report.push(`Linhas suspeitas: **${totalHits}**`);
  report.push("");
  report.push(`> Cada linha lista o termo detectado. Falsos positivos são esperados em URLs, nomes próprios e comentários — revise antes de substituir.`);
  report.push("");

  for (const [root, entries] of [...grouped.entries()].sort()) {
    report.push(`## ${root}/`);
    report.push("");
    entries.sort(([a], [b]) => a.localeCompare(b));
    for (const [file, hits] of entries) {
      report.push(`### \`${file}\` (${hits.length})`);
      report.push("");
      for (const h of hits.slice(0, 30)) {
        report.push(`- L${h.line} — \`${h.matches.join(", ")}\` — ${h.snippet.replace(/`/g, "\\`")}`);
      }
      if (hits.length > 30) report.push(`- … +${hits.length - 30} ocorrências`);
      report.push("");
    }
  }

  const out = "/mnt/documents/i18n-audit-report.md";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, report.join("\n"));
  console.log(`OK — relatório em ${out}`);
  console.log(`Arquivos: ${byFile.size} | Linhas: ${totalHits}`);
}

main();
