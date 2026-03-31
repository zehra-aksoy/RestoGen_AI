"use client";

import { useCallback, useRef, useState } from "react";
import { fileToCompressedBase64 } from "@/lib/image-file";
import { loadInventoryReports, saveInventoryReport } from "@/lib/inventory-reports";
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
  const [note, setNote] = useState("");
  const [reports, setReports] = useState(() => loadInventoryReports());

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

  function persistReport() {
    if (!items || items.length === 0) return;
    const summaryParts = items.map(it => `- **${it.name}** (${it.freshness}): ${it.action}`);
    saveInventoryReport({
      summary: summaryParts.join("\n"),
      note: note.trim(),
    });
    setReports(loadInventoryReports());
    setNote("");
  }

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
            <div className="mt-4">
              <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
                {items.map((it) => (
                  <li key={it.name + it.freshness} className="px-3 py-3 text-sm">
                    <p className="font-medium text-ink">{it.name}</p>
                    <p className="text-ink-muted">Tazelik: {it.freshness}</p>
                    <p className="mt-1 text-ink">{it.action}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-black/5 bg-sage-light/40 p-4 text-sm">
                <label className="block text-xs font-medium text-ink-muted" htmlFor="inventory-note">
                  Yerel kayıt notu
                </label>
                <textarea
                  id="inventory-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="envanter işlem notu…"
                />
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-sage/40 bg-white px-3 py-1.5 text-sm font-medium text-sage focus-ring hover:bg-sage/10 transition-colors"
                  onClick={persistReport}
                >
                  Özeti yerel listeye ekle
                </button>
              </div>
            </div>
          ) : null}
        </UiStates>
      </SectionCard>

      <SectionCard title="Son kayıtlar (yerel)" subtitle="En fazla 50 kayıt">
        {reports.length === 0 ? (
          <p className="text-sm text-ink-muted">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
            {reports.map((r) => (
              <li key={r.id} className="px-3 py-3 text-sm">
                <p className="text-xs text-ink-muted">
                  {new Date(r.createdAt).toLocaleString("tr-TR")}
                </p>
                <p className="mt-1 font-medium text-ink break-words">{r.summary}</p>
                {r.note ? <p className="mt-1 text-ink-muted">{r.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
