/** Model çıktısı bazen ```json ... ``` ile gelir; ham JSON metnine indirger. */
export function extractJsonArrayOrObject(raw: string): string {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(s);
  if (fence) s = fence[1].trim();
  return s;
}
