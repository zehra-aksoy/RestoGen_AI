"use client";

import { useCallback, useRef, useState } from "react";
import { fileToCompressedBase64 } from "@/lib/image-file";
import { SectionCard, UiStates } from "@/components/UiStates";

type InventoryItem = {
  name: string;
  freshness: string;
  action: string;
};

export function InventoryClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setItems(null);
    try {
      const { base64, mimeType } = await fileToCompressedBase64(file);
      const res = await fetch("/api/gemini/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = (await res.json()) as {
        error?: string;
        items?: InventoryItem[];
      };
      if (!res.ok) throw new Error(data.error ?? "Analiz başarısız.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Görsel envanter</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Fotoğraf yükleyin veya kamerayla çekin. Analiz sunucuda Gemini Vision ile
          yapılır; anahtarınız repoda tutulmaz.
        </p>
      </div>

      <SectionCard title="Tarama" subtitle="Dosya veya kamera">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void analyze(f);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white focus-ring disabled:opacity-50"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            Görsel seç / kamera
          </button>
        </div>
        <UiStates loading={loading} error={error}>
          {items && items.length === 0 ? (
            <p className="text-sm text-ink-muted">Öğe bulunamadı.</p>
          ) : null}
          {items && items.length > 0 ? (
            <ul className="mt-4 divide-y divide-black/5 rounded-xl border border-black/5">
              {items.map((it) => (
                <li key={it.name + it.freshness} className="px-3 py-3 text-sm">
                  <p className="font-medium text-ink">{it.name}</p>
                  <p className="text-ink-muted">Tazelik: {it.freshness}</p>
                  <p className="mt-1 text-ink">{it.action}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </UiStates>
      </SectionCard>
    </div>
  );
}
