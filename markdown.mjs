function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeHref(value) {
  const href = String(value).trim();
  if (/^(https?:\/\/|mailto:)/i.test(href) || /^(\/|#)/.test(href)) {
    return href;
  }
  return "";
}

const languageLabels = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  powershell: "PowerShell",
};

function renderCodeBlock(code, language = "") {
  const safeLanguage = language.toLowerCase().replace(/[^a-z0-9+-]/g, "");
  const label = languageLabels[safeLanguage] || safeLanguage || "Code";
  return `
    <div class="code-block">
      <div class="code-toolbar">
        <span>${escapeHtml(label)}</span>
        <button type="button" data-copy-code aria-label="Copy code">Copy</button>
      </div>
      <pre data-language="${safeLanguage}"><code class="${safeLanguage ? `language-${safeLanguage}` : ""}">${escapeHtml(code)}</code></pre>
    </div>`;
}

function renderInline(value) {
  const inlineCode = [];
  const links = [];
  const withoutCode = String(value).replace(/`([^`\n]+)`/g, (_, code) => {
    const index = inlineCode.push(code) - 1;
    return `\u0000INLINE${index}\u0000`;
  });
  const tokenized = withoutCode.replace(/\[([^\]]+)]\(([^\s)]+)(?:\s+["']([^"']+)["'])?\)/g, (source, label, href, title) => {
    const index = links.push({ source, label, href, title }) - 1;
    return `\u0000LINK${index}\u0000`;
  });

  return escapeHtml(tokenized)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+?)_(?!_)/g, "$1<em>$2</em>")
    .replace(/\u0000INLINE(\d+)\u0000/g, (_, index) => `<code>${escapeHtml(inlineCode[Number(index)])}</code>`)
    .replace(/\u0000LINK(\d+)\u0000/g, (_, index) => {
      const link = links[Number(index)];
      const href = sanitizeHref(link.href);
      if (!href) return escapeHtml(link.label);
      const external = /^https?:\/\//i.test(href);
      const title = link.title ? ` title="${escapeHtml(link.title)}"` : "";
      const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${title}${target}>${escapeHtml(link.label)}</a>`;
    });
}

function renderTextBlock(block) {
  const heading = block.match(/^(#{1,6})[ \t]+(.+)$/);
  if (heading) {
    const level = heading[1].length;
    return `<h${level}>${renderInline(heading[2])}</h${level}>`;
  }

  if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(block.trim())) {
    return "<hr />";
  }

  const lines = block.split("\n");
  if (lines.every((line) => /^ {4}|^\t/.test(line))) {
    const code = lines.map((line) => line.replace(/^(?: {4}|\t)/, "")).join("\n");
    return renderCodeBlock(code);
  }

  const listPattern = /^\s*(?:[-+*]|\d+\.)\s+(.+)$/;
  if (lines.every((line) => listPattern.test(line))) {
    const ordered = /^\s*\d+\./.test(lines[0]);
    const tag = ordered ? "ol" : "ul";
    const items = lines
      .map((line) => line.match(listPattern)[1])
      .map((item) => {
        const task = item.match(/^\[([ xX])\]\s+(.+)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x";
          return `<li class="task-list-item"><input type="checkbox" disabled ${checked ? "checked" : ""} aria-label="${checked ? "Completed" : "Not completed"}" />${renderInline(task[2])}</li>`;
        }
        return `<li>${renderInline(item)}</li>`;
      })
      .join("");
    return `<${tag}>${items}</${tag}>`;
  }

  if (lines.every((line) => /^>[ \t]?/.test(line))) {
    const quote = lines.map((line) => line.replace(/^>[ \t]?/, "")).join("\n");
    return `<blockquote>${renderInline(quote).replaceAll("\n", "<br />")}</blockquote>`;
  }

  return `<p>${renderInline(block).replaceAll("\n", "<br />")}</p>`;
}

/**
 * Render assistant text as safe, dependency-free Markdown.
 * More block and inline features are layered on by small parser helpers.
 */
export function renderMarkdown(markdown = "") {
  const normalized = String(markdown).replaceAll("\r\n", "\n").trim();
  if (!normalized) return "";

  const codeBlocks = [];
  const tokenized = normalized.replace(/```([\w+-]*)[ \t]*\n([\s\S]*?)```/g, (_, language, code) => {
    const index = codeBlocks.push({ language: language.toLowerCase(), code: code.replace(/\n$/, "") }) - 1;
    return `\n\n@@CODE:${index}@@\n\n`;
  });

  return tokenized
    .split(/\n{2,}/)
    .map((paragraph) => {
      const codeMatch = paragraph.match(/^@@CODE:(\d+)@@$/);
      if (codeMatch) {
        const block = codeBlocks[Number(codeMatch[1])];
        return renderCodeBlock(block.code, block.language);
      }
      return renderTextBlock(paragraph);
    })
    .join("");
}
