"use client";

import { useState } from "react";
import { loadRecipeReports, saveRecipeReport } from "@/lib/recipe-reports";
import { SectionCard, UiStates } from "@/components/UiStates";
import { SafeMarkdownLite } from "@/components/SafeMarkdownLite";

export function RecipeClient() {
  const [ingredients, setIngredients] = useState("");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [note, setNote] = useState("");
  const [reports, setReports] = useState(() => loadRecipeReports());

  async function generate() {
    setLoading(true);
    setError(null);
    setMarkdown(null);
    try {
      const res = await fetch("/api/gemini/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = (await res.json()) as { error?: string; markdown?: string };
      if (!res.ok) throw new Error(data.error ?? "Tarif üretilemedi.");
      setMarkdown(data.markdown ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function persistReport() {
    if (!markdown) return;
    saveRecipeReport({
      summary: `**Artan Malzemeler:** ${ingredients}\n\n${markdown}`,
      note: note.trim(),
    });
    setReports(loadRecipeReports());
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-ink">Sıfır-Atık Tarif</h1>
        <p className="mt-2 text-ink-muted leading-relaxed">
          Artan malzemeleri yazın; Gemini sıfır atık prensibiyle yeni bir tarif önersin.
        </p>
      </div>

      <SectionCard title="Malzemeler" subtitle="Virgül veya satır ile ayırabilirsiniz">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
          placeholder="örn: 2 domates, pişmiş mercimek, yarım demet maydanoz…"
        />
        <button
          type="button"
          className="mt-3 rounded-lg bg-[#DE5E21] hover:bg-[#C05621] px-4 py-2 text-sm font-medium text-white shadow-sm focus-ring disabled:opacity-50 transition-colors"
          disabled={loading || !ingredients.trim()}
          onClick={() => void generate()}
        >
          Tarif üret
        </button>
      </SectionCard>

      <SectionCard title="Öneri">
        <UiStates
          loading={loading}
          error={error}
          empty={!markdown && !loading && !error}
          emptyText="Henüz tarif yok."
        >
          {markdown ? (
            <>
              <SafeMarkdownLite source={markdown} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-black/10 bg-clay-light px-4 py-2 text-sm font-medium text-ink focus-ring"
                  onClick={() => void copy()}
                >
                  {copied ? "Kopyalandı" : "Markdown olarak kopyala"}
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-black/5 bg-sage-light/40 p-4 text-sm">
                <label className="block text-xs font-medium text-ink-muted" htmlFor="recipe-note">
                  Yerel kayıt notu
                </label>
                <textarea
                  id="recipe-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="tarif işlem notu…"
                />
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-sage/40 bg-white px-3 py-1.5 text-sm font-medium text-sage focus-ring hover:bg-sage/10 transition-colors"
                  onClick={persistReport}
                >
                  Özeti yerel listeye ekle
                </button>
              </div>
            </>
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
