/**
 * A small, deliberately constrained Markdown-to-HTML renderer for AI chat
 * responses. It supports just what a typical AI answer actually uses:
 * headers, bold/italic, inline code, fenced code blocks, ordered/unordered
 * lists, safe http(s) links, and paragraphs.
 *
 * Security: every piece of raw text is HTML-escaped BEFORE any tag is ever
 * generated, so the AI's output can never inject arbitrary markup, only the
 * specific safe tags this function itself builds ever appear in the result.
 * Angular's own [innerHTML] sanitizer still runs on top of this as a second
 * layer of defense (this function's output is bound as a plain string, not
 * wrapped with DomSanitizer.bypassSecurityTrustHtml, so Angular keeps
 * scrubbing it normally).
 */

interface ExtractedCodeBlock {
  html: string;
}

const CODE_FENCE_RE = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
const PLACEHOLDER_PREFIX = '\u0000CB';
const PLACEHOLDER_SUFFIX = '\u0000';

export function renderChatMarkdown(raw: string): string {
  const codeBlocks: ExtractedCodeBlock[] = [];

  const withPlaceholders = raw.replace(CODE_FENCE_RE, (_match, lang: string, code: string) => {
    const index = codeBlocks.length;
    const safeLang = (lang || 'text').toLowerCase().replace(/[^a-z0-9]/g, '') || 'text';
    codeBlocks.push({ html: buildCodeBlockHtml(safeLang, code) });
    return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
  });

  const placeholderLineRe = new RegExp(`^${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}$`);
  const lines = withPlaceholders.split('\n');
  const htmlParts: string[] = [];
  let listMode: 'ul' | 'ol' | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      htmlParts.push(`<p>${paragraphBuffer.join(' ')}</p>`);
      paragraphBuffer = [];
    }
  };
  const closeList = () => {
    if (listMode) {
      htmlParts.push(listMode === 'ul' ? '</ul>' : '</ol>');
      listMode = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const placeholderMatch = rawLine.trim().match(placeholderLineRe);
    if (placeholderMatch) {
      flushParagraph();
      closeList();
      htmlParts.push(codeBlocks[Number(placeholderMatch[1])].html);
      continue;
    }

    const line = escapeHtml(rawLine);
    const trimmed = line.trim();

    if (!trimmed) {
      // A blank line only ends the current list if what follows isn't more
      // of the SAME list - AI answers often put a blank line between list
      // items for readability, which shouldn't fragment one list into many
      // (each restarting the visible numbering back at "1.").
      if (listMode && continuesList(lines, i + 1, listMode)) continue;
      flushParagraph();
      closeList();
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headerMatch) {
      flushParagraph();
      closeList();
      const level = Math.min(headerMatch[1].length + 2, 6);
      htmlParts.push(`<h${level} class="chat-md-heading">${formatInline(headerMatch[2])}</h${level}>`);
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (listMode !== 'ul') {
        closeList();
        htmlParts.push('<ul class="chat-md-list">');
        listMode = 'ul';
      }
      htmlParts.push(`<li>${formatInline(bulletMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listMode !== 'ol') {
        closeList();
        htmlParts.push('<ol class="chat-md-list">');
        listMode = 'ol';
      }
      htmlParts.push(`<li>${formatInline(orderedMatch[1])}</li>`);
      continue;
    }

    closeList();
    paragraphBuffer.push(formatInline(trimmed));
  }

  flushParagraph();
  closeList();

  return htmlParts.join('\n');
}

/** Looks past any further blank lines to see if the SAME kind of list item continues. */
function continuesList(lines: string[], fromIndex: number, listMode: 'ul' | 'ol'): boolean {
  for (let j = fromIndex; j < lines.length; j++) {
    const trimmed = lines[j].trim();
    if (!trimmed) continue;
    return listMode === 'ul' ? /^[-*]\s+/.test(trimmed) : /^\d+\.\s+/.test(trimmed);
  }
  return false;
}

function buildCodeBlockHtml(lang: string, rawCode: string): string {
  const escaped = escapeHtml(rawCode.replace(/\n$/, ''));
  return (
    '<div class="chat-code-block">' +
    '<div class="chat-code-block__header">' +
    `<span>${escapeHtml(lang)}</span>` +
    '<button type="button" class="chat-code-block__copy" data-copy-code>Copy</button>' +
    '</div>' +
    `<pre><code class="language-${escapeHtml(lang)}">${escaped}</code></pre>` +
    '</div>'
  );
}

/** Inline-level formatting: inline code, bold, italic, then safe http(s) links. */
function formatInline(escapedText: string): string {
  let text = escapedText.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Non-greedy so "**text *nested* text**" closes at the nearest "**",
  // instead of refusing to match at all because of the inner single star.
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
