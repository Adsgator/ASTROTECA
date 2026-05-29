// src/lib/markdown.ts
// Renderizador leve sem dependência externa. Output em <div class="markdown-content">.

export function markdownToHtml(md: string): string {
  let html = md
    // Escapa HTML básico antes de processar
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (antes de tudo para não processar o conteúdo interno)
  const codeBlocks: string[] = []
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlocks.length
    const inner = match.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
    codeBlocks.push(`<pre><code>${inner}</code></pre>`)
    return `\x00CODE${idx}\x00`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // HR
  html = html.replace(/^---+$/gm, '<hr>')

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Tables
  html = html.replace(/(?:^[|].+[|]\s*\n)+/gm, (table) => {
    const rows = table.trim().split('\n').filter(r => !/^\|[-| ]+\|$/.test(r.trim()))
    if (rows.length === 0) return table
    const [header, ...body] = rows
    const thCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const tbRows = body.map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `<table><thead><tr>${thCells}</tr></thead><tbody>${tbRows}</tbody></table>`
  })

  // Unordered lists
  html = html.replace(/(^[-*] .+$(\n[-*] .+$)*)/gm, (block) => {
    const items = block.split('\n').map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')
    return `<ul>${items}</ul>`
  })

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Paragraphs (linhas soltas que não são tags HTML)
  html = html.replace(/^(?!<[h|u|o|t|p|h]|$|\x00)(.+)$/gm, '<p>$1</p>')

  // Restaura code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`\x00CODE${idx}\x00`, block)
  })

  return `<div class="markdown-content">${html}</div>`
}
