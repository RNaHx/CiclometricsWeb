const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'Proyecto_Hito2_Segunda_Vista_RH.md');
const htmlPath = path.join(__dirname, 'Proyecto_Hito2_Segunda_Vista_RH.html');

let md = fs.readFileSync(mdPath, 'utf8');

function markdownToHtml(content) {
  let lines = content.split('\n');
  let html = [];
  let inTable = false;
  let inCode = false;
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('```')) {
      if (inCode) {
        html.push('</pre></div>');
        inCode = false;
      } else {
        html.push('<div class="code-block"><pre>');
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      html.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      let cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        html.push('<div class="table-container"><table class="apa-table"><thead><tr>');
        cells.forEach(c => html.push(`<th>${formatInline(c)}</th>`));
        html.push('</tr></thead><tbody>');
        inTable = true;
      } else {
        html.push('<tr>');
        cells.forEach(c => html.push(`<td>${formatInline(c)}</td>`));
        html.push('</tr>');
      }
      continue;
    } else if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
    }

    if (/^\s*[-•]\s+(.*)/.test(line)) {
      let match = line.match(/^\s*[-•]\s+(.*)/);
      if (!inUl) {
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${formatInline(match[1])}</li>`);
      continue;
    } else if (inUl && !/^\s*[-•]\s+/.test(line)) {
      html.push('</ul>');
      inUl = false;
    }

    if (/^\s*\d+\.\s+(.*)/.test(line)) {
      let match = line.match(/^\s*\d+\.\s+(.*)/);
      if (!inOl) {
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${formatInline(match[1])}</li>`);
      continue;
    } else if (inOl && !/^\s*\d+\.\s+/.test(line)) {
      html.push('</ol>');
      inOl = false;
    }

    if (line.startsWith('# ')) {
      html.push(`<h1 class="main-title">${formatInline(line.substring(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2>${formatInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      html.push(`<h3>${formatInline(line.substring(4))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      html.push(`<h4>${formatInline(line.substring(5))}</h4>`);
      continue;
    }

    if (line.trim() === '---') {
      html.push('<hr class="section-divider" />');
      continue;
    }

    if (line.trim().length > 0) {
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inTable) html.push('</tbody></table></div>');
  if (inUl) html.push('</ul>');
  if (inOl) html.push('</ol>');
  if (inCode) html.push('</pre></div>');

  return html.join('\n');
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

const bodyHtml = markdownToHtml(md);

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CicloMetrics Web - Hito 2 Proyecto de Título UNAB (Segunda Vista del Prototipo)</title>
  <style>
    @page {
      size: letter;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      @bottom-right {
        content: counter(page);
      }
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111827;
      margin: 0;
      padding: 2.5cm;
      background: #ffffff;
    }
    @media screen {
      body {
        max-width: 850px;
        margin: 20px auto;
        padding: 40px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-radius: 8px;
        background: #fafafa;
      }
    }
    h1.main-title {
      font-size: 17pt;
      text-align: center;
      text-transform: uppercase;
      margin-top: 20px;
      margin-bottom: 25px;
      font-weight: bold;
      color: #0f172a;
    }
    h2 {
      font-size: 13.5pt;
      margin-top: 32px;
      margin-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      color: #1e293b;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      margin-top: 22px;
      margin-bottom: 8px;
      color: #334155;
      page-break-after: avoid;
    }
    h4 {
      font-size: 11.5pt;
      font-style: italic;
      margin-top: 16px;
      margin-bottom: 6px;
      color: #475569;
      page-break-after: avoid;
    }
    p {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 1.25cm;
    }
    p strong, p em {
      text-indent: 0;
    }
    ul, ol {
      margin-left: 2cm;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 6px;
    }
    .table-container {
      margin: 25px 0;
      page-break-inside: avoid;
    }
    table.apa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5pt;
      line-height: 1.4;
      margin: 15px 0;
    }
    table.apa-table th {
      border-top: 2px solid #000;
      border-bottom: 1px solid #000;
      padding: 8px 10px;
      text-align: left;
      font-weight: bold;
      background: #f8fafc;
    }
    table.apa-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    table.apa-table tbody tr:last-child td {
      border-bottom: 2px solid #000;
    }
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
    }
    code {
      font-family: "Courier New", Courier, monospace;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 10pt;
    }
    hr.section-divider {
      border: 0;
      height: 1px;
      background: #cbd5e1;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('Documento HTML de Proyecto generado con éxito en:', htmlPath);
