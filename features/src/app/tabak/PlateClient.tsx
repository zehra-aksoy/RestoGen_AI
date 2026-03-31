"use client";

import { useCallback, useRef, useState } from "react";
import { fileToCompressedBase64 } from "@/lib/image-file";
import { loadPlateReports, savePlateReport } from "@/lib/plate-reports";
import { SectionCard, UiStates } from "@/components/UiStates";

type PlateResult = {
  estimatedWastePercent?: number;
  foodType?: string;
  notes?: string;
  suggestedActions?: string[];
};

export function PlateClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<PlateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reports, setReports] = useState(() => loadPlateReports());

  const analyze = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { base64, mimeType } = await fileToCompressedBase64(file);
      const res = await fetch("/api/gemini/plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = (await res.json()) as PlateResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Analiz başarısız.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
    } finally {
      setLoading(false);
    }
  }, []);

  function persistReport() {
    if (!result) return;
    const summaryParts = [
      result.foodType ? `Tür: ${result.foodType}` : null,
      typeof result.estimatedWastePercent === "number"
        ? `Tahmini fire: %${result.estimatedWastePercent}`
        : null,
      result.notes ?? null,
    ].filter(Boolean);
    savePlateReport({
      summary: summaryParts.join(" · "),
      note: note.trim(),
    });
    setReports(loadPlateReports());
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-ink">Tabak Artığı Analizi</h1>
        <p className="mt-2 text-ink-muted leading-relaxed">
          Tüketilmeyen porsiyonları fotoğraflayın; görüntü analiz edilip tahmini fire oranı çıkarılsın. Kayıtlarınız sadece yerel cihazda saklanır.
        </p>
      </div>

      <SectionCard title="Görsel analiz" subtitle="Gemini Vision">
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
        <button
          type="button"
          className="rounded-lg bg-[#DE5E21] hover:bg-[#C05621] px-4 py-2 text-sm font-medium text-white shadow-sm focus-ring disabled:opacity-50 transition-colors"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          Fotoğraf yükle / çek
        </button>

        <UiStates loading={loading} error={error}>
          {result ? (
            <div className="mt-4 rounded-xl border border-black/5 bg-sage-light/40 p-4 text-sm">
              {typeof result.estimatedWastePercent === "number" ? (
                <p className="font-medium text-ink">
                  Tahmini tüketilmeyen: %{result.estimatedWastePercent}
                </p>
              ) : null}
              {result.foodType ? (
                <p className="mt-1 text-ink-muted">Yemek türü: {result.foodType}</p>
              ) : null}
              {result.notes ? (
                <p className="mt-2 text-ink">{result.notes}</p>
              ) : null}
              {result.suggestedActions && result.suggestedActions.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-ink">
                  {result.suggestedActions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : null}

              <label className="mt-4 block text-xs font-medium text-ink-muted" htmlFor="plate-note">
                Yerel kayıt notu
              </label>
              <textarea
                id="plate-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                placeholder="vardiya / menü notu…"
              />
              <button
                type="button"
                className="mt-2 rounded-lg border border-sage/40 bg-white px-3 py-1.5 text-sm font-medium text-sage focus-ring"
                onClick={persistReport}
              >
                Özeti yerel listeye ekle
              </button>
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
                <p className="mt-1 font-medium text-ink">{r.summary}</p>
                {r.note ? <p className="mt-1 text-ink-muted">{r.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
