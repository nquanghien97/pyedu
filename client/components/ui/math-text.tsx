'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

/**
 * Render văn bản chứa biểu thức LaTeX inline `$...$` và block `$$...$$`.
 * - `$$...$$` => block-level math (display)
 * - `$...$`  => inline math
 * - Phần còn lại hiển thị dạng text thường.
 */
export function MathText({ text, className, as: Tag = 'span' }: MathTextProps) {
  const rendered = useMemo(() => {
    if (!text) return '';

    // Regex tách block ($$...$$) và inline ($...$)
    // Ưu tiên match block trước, sau đó inline
    const parts: string[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Phần text trước biểu thức
      if (match.index > lastIndex) {
        parts.push(escapeHtml(text.slice(lastIndex, match.index)));
      }

      const raw = match[0];
      const isBlock = raw.startsWith('$$') && raw.endsWith('$$');
      const latex = isBlock ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim();

      try {
        const html = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: isBlock,
          trust: true,
          strict: false,
        });
        parts.push(html);
      } catch {
        // Fallback hiển thị raw nếu KaTeX parse lỗi
        parts.push(`<code>${escapeHtml(raw)}</code>`);
      }

      lastIndex = regex.lastIndex;
    }

    // Phần text cuối
    if (lastIndex < text.length) {
      parts.push(escapeHtml(text.slice(lastIndex)));
    }

    return parts.join('');
  }, [text]);

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
