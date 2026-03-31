import type { ReactNode } from "react";
import { escapeHtml } from "@/lib/html";

/**
 * Basit markdown alt kümesi: ## başlık, ###, - madde, düz paragraflar.
 * Tam markdown parser değildir; güvenlik için metin kaçırılır.
 */
export function SafeMarkdownLite({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const flushParagraph = (acc: string[]) => {
    if (acc.length === 0) return;
    const text = acc.join("\n").trim();
    if (!text) return;
    blocks.push(
      <p key={key++} className="mb-3 text-ink leading-relaxed">
        <span dangerouslySetInnerHTML={{ __html: escapeHtml(text) }} />
      </p>,
    );
    acc.length = 0;
  };

  const para: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      flushParagraph(para);
      blocks.push(
        <h4 key={key++} className="mt-4 font-semibold text-ink">
          <span
            dangerouslySetInnerHTML={{ __html: escapeHtml(line.slice(4)) }}
          />
        </h4>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph(para);
      blocks.push(
        <h3 key={key++} className="mt-6 text-lg font-semibold text-ink">
          <span
            dangerouslySetInnerHTML={{ __html: escapeHtml(line.slice(3)) }}
          />
        </h3>,
      );
      i += 1;
      continue;
    }
    if (line.trimStart().startsWith("- ")) {
      flushParagraph(para);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const m = /^\s*-\s(.*)$/.exec(l);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push(
        <ul key={key++} className="mb-3 list-inside list-disc space-y-1">
          {items.map((it, idx) => (
            <li
              key={`${key}-li-${idx}`}
              dangerouslySetInnerHTML={{ __html: escapeHtml(it) }}
            />
          ))}
        </ul>,
      );
      continue;
    }
    if (line.trim() === "") {
      flushParagraph(para);
      i += 1;
      continue;
    }
    para.push(line);
    i += 1;
  }
  flushParagraph(para);

  return <div className={className}>{blocks}</div>;
}
