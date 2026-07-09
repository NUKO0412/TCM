/**
 * Post-build : génère dist/mentions-legales/index.html avec le contenu légal
 * rendu côté serveur et des métas propres à la page.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { ROUTES } from '../src/config/routes.ts'

const here = dirname(fileURLToPath(import.meta.url))
const LEGAL_TITLE = 'Mentions légales — TCM Agencement'
const LEGAL_DESCRIPTION =
  'Mentions légales, politique de confidentialité et cookies du site TCM Agencement, menuiserie et agencement sur mesure à Lorient.'
const LEGAL_CANONICAL = 'https://www.tcmagencement.fr/mentions-legales'

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function replaceRoot(html: string, body: string): string {
  const rootStart = html.indexOf('<div id="root"')
  const bodyEnd = html.lastIndexOf('</body>')
  const rootEnd = html.lastIndexOf('</div>', bodyEnd)
  if (rootStart < 0 || bodyEnd < 0 || rootEnd < rootStart) {
    throw new Error('root introuvable dans dist/index.html')
  }
  return `${html.slice(0, rootStart)}<div id="root" data-prerendered="1">${body}</div>${html.slice(
    rootEnd + '</div>'.length,
  )}`
}

function replaceHead(html: string): string {
  const legalHead = `
    <meta name="description" content="${esc(LEGAL_DESCRIPTION)}" />
    <link rel="canonical" href="${LEGAL_CANONICAL}" />
    <meta property="og:url" content="${LEGAL_CANONICAL}" />
    <meta property="og:title" content="${esc(LEGAL_TITLE)}" />
    <meta property="og:description" content="${esc(LEGAL_DESCRIPTION)}" />
    <meta name="twitter:title" content="${esc(LEGAL_TITLE)}" />
    <meta name="twitter:description" content="${esc(LEGAL_DESCRIPTION)}" />
  `

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(LEGAL_TITLE)}</title>`)
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->\s*/, '')
    .replace(/<!-- faq:start -->[\s\S]*?<!-- faq:end -->\s*/, '')
    .replace(/<\/head>/, `${legalHead}\n</head>`)
}

async function main() {
  const { render } = (await import(pathToFileURL(resolve(here, '../dist-ssr/entry-server.js')).href)) as {
    render: (route?: string) => string
  }

  const body = render(ROUTES.legal)
  if (!body.trim()) throw new Error('rendu légal vide')

  const indexPath = resolve(here, '../dist/index.html')
  const outputDir = resolve(here, '../dist/mentions-legales')
  let html = readFileSync(indexPath, 'utf8')
  html = replaceRoot(replaceHead(html), body)

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'index.html'), html)
  console.log('✓ Page /mentions-legales pré-rendue dans dist/mentions-legales/index.html')
}

main().catch((error) => {
  throw error instanceof Error ? error : new Error(String(error))
})
