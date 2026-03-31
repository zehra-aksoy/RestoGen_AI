import { escapeHtml } from "@/lib/html";

type Props = {
  text: string;
  className?: string;
};

/** AI veya kullanıcı metnini XSS’e karşı güvenli biçimde gösterir. */
export function SafeText({ text, className = "" }: Props) {
  return (
    <div
      className={`whitespace-pre-wrap break-words text-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: escapeHtml(text) }}
    />
  );
}
