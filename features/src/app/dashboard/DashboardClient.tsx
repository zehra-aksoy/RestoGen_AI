"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildPrepAdvice } from "@/lib/prep-advice";
import {
  fetchWeatherClient,
  geocodeCityToCoords,
  weatherCodeLabel,
  type WeatherSummary,
} from "@/lib/openmeteo";
import {
  WASTE_TARGET_PERCENT,
  loadWasteSnapshot,
} from "@/lib/metrics";
import {
  loadRestogenSettings,
  type RestogenSettings,
} from "@/lib/restogen-settings";
import { loadInventoryReports } from "@/lib/inventory-reports";
import { loadRecipeReports } from "@/lib/recipe-reports";
import { SectionCard, UiStates } from "@/components/UiStates";
import { LoadingScreen } from "@/components/LoadingScreen";
import { OrderChecklist } from "@/components/OrderChecklist";
import { SafeMarkdownLite } from "@/components/SafeMarkdownLite";

const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;

export function DashboardClient() {
  const router = useRouter()
  const [settings, setSettings] = useState<RestogenSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [wErr, setWErr] = useState<string | null>(null);
  const [wLoading, setWLoading] = useState(true);
  
  const [risk, setRisk] = useState(45);
  const [expectedCustomers, setExpectedCustomers] = useState<number | "">("");
  const [plateWastePercent, setPlateWastePercent] = useState<number | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [donotOrderList, setDonotOrderList] = useState<string[]>([]);
  const [prepAdviceMarkdown, setPrepAdviceMarkdown] = useState("");
  
  const advice = useMemo(
    () => buildPrepAdvice(weather, new Date(), risk),
    [weather, risk],
  );
  
  const [chefEmail, setChefEmail] = useState<string>("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  
  type HistoryItem = { date: string; riskScore: number; summary: string };
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [recentInventory, setRecentInventory] = useState<string[]>([]);
  const [recentRecipe, setRecentRecipe] = useState<string[]>([]);

  const parsedAdvice = useMemo(() => {
    if (!prepAdviceMarkdown) return null;
    let expected = "";
    let todos = "";
    let tips = "";
    try {
      const parts1 = prepAdviceMarkdown.split("📌 Yapılması Gerekenler:");
      if (parts1.length === 2) {
        expected = parts1[0].replace("Beklenen Müşteri:", "").trim();
        const parts2 = parts1[1].split("💡 Öneriler:");
        if (parts2.length === 2) {
          todos = parts2[0].trim();
          tips = parts2[1].trim();
        } else {
          todos = parts1[1].trim();
        }
      } else {
        todos = prepAdviceMarkdown;
      }
    } catch {
       todos = prepAdviceMarkdown;
    }
    return { expected, todos, tips };
  }, [prepAdviceMarkdown]);

  const hasAutoAnalyzed = useRef(false);

  useEffect(() => {
    const cached = localStorage.getItem("dashboard_analysis_cache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.analysisSummary) setAnalysisSummary(data.analysisSummary);
        if (data.risk !== undefined) setRisk(data.risk);
        if (data.donotOrderList) setDonotOrderList(data.donotOrderList);
        if (data.expectedCustomers !== undefined) setExpectedCustomers(data.expectedCustomers);
        if (data.plateWastePercent !== undefined) setPlateWastePercent(data.plateWastePercent);
        if (data.prepAdviceMarkdown) setPrepAdviceMarkdown(data.prepAdviceMarkdown);
      } catch (e) {
        console.error("Cache okuma hatası", e);
      }
    }

    const saved = localStorage.getItem("restogen_analysis_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Geçmiş okuma hatası", e);
      }
    }
    const savedEmail = localStorage.getItem("restogen_chef_email");
    if (savedEmail) {
      setChefEmail(savedEmail);
    }
    
    // Yüklenen en son envanter ve tarif notları (varsa)
    try {
      const invs = loadInventoryReports().slice(0, 1);
      const recs = loadRecipeReports().slice(0, 1);
      
      setRecentInventory(invs.map((i) => {
        let text = i.summary;
        if (i.note) text = `**Şefin Notu:** ${i.note}\n\n**Analiz:** ${text}`;
        return text;
      }));
      setRecentRecipe(recs.map((r) => {
        let text = r.summary;
        if (r.note) text = `**Şefin Notu:** ${r.note}\n\n${text}`;
        return text;
      }));
    } catch (e) {
      console.error("Notlar yüklenemedi", e);
    }
  }, []);

  const analyzeWithGemini = async (isSilent = false) => {
    if (!settings) return;

    if (!isSilent && (!chefEmail || chefEmail.trim() === "")) {
      alert("Lütfen bildirimler için önce ayarlar (çark ikonu) kısmından mail adresinizi girin.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const currentExpected = expectedCustomers !== "" ? expectedCustomers : Math.round(settings.dailyAvgCapacity * advice.multiplier);
      const currentPlateWaste = plateWastePercent !== "" ? plateWastePercent : 0;

      if (!isSilent) {
        setExpectedCustomers(currentExpected);
        setPlateWastePercent(currentPlateWaste);
      }

      const res = await fetch("/api/gemini/dashboard-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          expectedCustomers: currentExpected,
          plateWastePercent: currentPlateWaste,
          weather,
          history,
          chefEmail,
          recentInventory,
          recentRecipe
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API hatası");
      
      setRisk(data.riskScore);
      setAnalysisSummary(data.analysisSummary);
      setDonotOrderList(data.donotOrderList);
      if (data.prepAdviceMarkdown) setPrepAdviceMarkdown(data.prepAdviceMarkdown);

      if (isSilent) {
        setExpectedCustomers(currentExpected);
        setPlateWastePercent(currentPlateWaste);
      }

      const newHistoryItem = {
        date: new Date().toLocaleDateString("tr-TR"),
        riskScore: data.riskScore,
        summary: data.analysisSummary,
      };
      const updatedHistory = [...history, newHistoryItem].slice(-5);
      setHistory(updatedHistory);
      localStorage.setItem("restogen_analysis_history", JSON.stringify(updatedHistory));
      
      localStorage.setItem("dashboard_analysis_cache", JSON.stringify({
        analysisSummary: data.analysisSummary,
        risk: data.riskScore,
        donotOrderList: data.donotOrderList,
        expectedCustomers: currentExpected,
        plateWastePercent: currentPlateWaste,
        prepAdviceMarkdown: data.prepAdviceMarkdown
      }));
      
    } catch (e: unknown) {
      console.error(e);
      if (!isSilent) {
        alert("Analiz sırasında bir hata oluştu: " + (e instanceof Error ? e.message : String(e)));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (
      !settingsLoading &&
      !wLoading &&
      !isAnalyzing &&
      !hasAutoAnalyzed.current &&
      settings &&
      !analysisSummary
    ) {
      hasAutoAnalyzed.current = true;
      void analyzeWithGemini(true);
    }
  }, [settingsLoading, wLoading, isAnalyzing, settings, analysisSummary, analyzeWithGemini]);

  useEffect(() => {
    const snap = loadWasteSnapshot();
    if (snap) {
      setRisk(snap.riskScore);
    }
  }, []);

  useEffect(() => {
    const s = loadRestogenSettings()
    if (!s) {
      router.replace("/")
      return
    }
    setSettings(s)
    setSettingsLoading(false)
  }, [router])

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (settingsLoading) return;

      setWLoading(true);
      setWErr(null);
      const applyCoords = async (lat: number, lon: number) => {
        try {
          const w = await fetchWeatherClient(lat, lon);
          if (!cancelled) setWeather(w);
        } catch (e) {
          if (!cancelled)
            setWErr(e instanceof Error ? e.message : "Hava verisi alınamadı.");
        } finally {
          if (!cancelled) setWLoading(false);
        }
      };

      const getFallbackCoords = async () => {
        if (settings?.city) {
          const coords = await geocodeCityToCoords(settings.city).catch(
            () => null,
          );
          if (coords) return coords
        }
        return { latitude: DEFAULT_LAT, longitude: DEFAULT_LON }
      };

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            void applyCoords(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            void (async () => {
              const coords = await getFallbackCoords();
              await applyCoords(coords.latitude, coords.longitude);
            })();
          },
          { timeout: 8000, maximumAge: 600_000 },
        );
      } else {
        const coords = await getFallbackCoords();
        await applyCoords(coords.latitude, coords.longitude);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [settingsLoading, settings]);

  return (
    <>
      <LoadingScreen isLoading={settingsLoading || wLoading || isAnalyzing} />
      <div className="space-y-8">
        {/* Full Width Hero Card */}
        <div 
          className="relative overflow-hidden rounded-2xl shadow-lg min-h-[260px] lg:min-h-[300px] flex items-center justify-center p-8 bg-sidebar"
        >
          {/* Settings Gear Icon */}
          <button 
            onClick={() => {
              setTempEmail(chefEmail);
              setShowEmailModal(true);
            }}
            className="absolute top-4 right-5 z-20 p-2 text-cream/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title="E-posta Ayarları"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop"
            alt="Professional healthy kitchen"
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar/90 via-sidebar/40 to-transparent" />
          
          <div className="relative z-10 text-center flex flex-col items-center max-w-2xl">
            <h1 className="text-3xl font-serif font-bold text-cream sm:text-5xl leading-tight drop-shadow-md">
              İyi Günler, {settings?.name ? settings.name.split(" ")[0] : "Şef"}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-cream/90 font-medium tracking-wide">
              {settings
                ? `${settings.businessName} için bugünkü analizim hazır!`
                : "Günlük israf riski ve hazırlık özeti."}
            </p>
            {settingsLoading ? null : settings ? (
              <p className="mt-2 text-xs sm:text-sm text-cream/70 backdrop-blur-sm bg-black/20 px-4 py-1.5 rounded-full inline-block">
                Aşağıdaki özet, hava durumu ve kurum takvimine göre hazırlanır.
              </p>
            ) : null}
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Sol Kolon: Günlük İsraf Riski */}
        <SectionCard
          title="Günlük israf riski (özet)"
          subtitle={`Hedef: aşırı hazırlık israfını ~%${WASTE_TARGET_PERCENT} azaltma.`}
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Gelen Müşteri
                </label>
                <input
                  type="number"
                  value={expectedCustomers === "" ? "" : expectedCustomers}
                  onChange={(e) => setExpectedCustomers(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Örn. 120"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Dönen Tabak Atığı (%)
                </label>
                <input
                  type="number"
                  value={plateWastePercent === "" ? "" : plateWastePercent}
                  onChange={(e) => setPlateWastePercent(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Örn. 15"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
            <button
              onClick={() => analyzeWithGemini(false)}
              disabled={isAnalyzing || expectedCustomers === "" || plateWastePercent === ""}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-2 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Yapay Zeka ile Analizi Başlat
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-6 border-t border-black/5 mt-4">
          <div className="relative w-full max-w-[280px]">
            <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible drop-shadow-sm">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="currentColor"
                className="text-black/5"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Filled Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={251.3}
                strokeDashoffset={251.3 * (1 - risk / 100)}
                className="transition-all duration-1000 ease-out"
                filter="url(#glow)"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end text-center pb-2">
              <span className="text-5xl font-bold tracking-tight text-ink">
                %{risk}
              </span>
              <span className={`text-sm font-semibold tracking-wide uppercase mt-1 ${
                risk < 40 ? "text-emerald-500" : risk < 70 ? "text-orange-500" : "text-red-500"
              }`}>
                {risk < 40 ? "Düşük" : risk < 70 ? "Orta" : "Kritik"}
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-gradient-to-br from-sage/10 to-transparent p-5 text-left border border-sage/20 w-full relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage/20 text-sage text-xs">
                ✨
              </div>
              <h4 className="text-sm font-semibold text-ink">Gemini Analiz Özeti</h4>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {analysisSummary ? analysisSummary : "🍽️ Envanter durumu ve artan tabak analizi bekleniyor..."}
            </p>
          </div>
        </div>
        </SectionCard>

        {/* Sağ Kolon: Sipariş Kontrol Paneli */}
        <SectionCard title="Sipariş Kontrol Paneli" subtitle="Yapay zeka analizleri ve güncel stok durumu.">
          <OrderChecklist aiWarnings={donotOrderList} />
        </SectionCard>

        {/* Alt Satır: Hava Durumu vs. */}
        <SectionCard title="Hava durumu">
          <UiStates loading={wLoading} error={wErr}>
            {weather ? (
              <div className="text-sm">
                <p className="font-medium text-ink">
                  {weather.temperatureC.toFixed(0)}°C ·{" "}
                  {weatherCodeLabel(weather.code)}
                </p>
                <p className="mt-1 text-ink-muted">
                  Yağış: {weather.precipitationMm.toFixed(1)} mm · Güncelleme:{" "}
                  {weather.fetchedAt}
                </p>
              </div>
            ) : null}
          </UiStates>
        </SectionCard>

        {/* Alt Satır: Hazırlık Tavsiyesi (Taşındı) */}
        <SectionCard title="Yapay Zeka Hazırlık Tavsiyesi">
          {parsedAdvice ? (
            <div className="flex flex-col gap-6">
              {/* Beklenen Müşteri Hero Card */}
              {parsedAdvice.expected && (
                <div className="bg-gradient-to-r from-emerald-50 to-sage/10 p-6 rounded-2xl border border-sage/20 text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-sage/10 rounded-full w-24 h-24 blur-2xl"></div>
                  <h4 className="text-sm font-bold text-sage uppercase tracking-wider mb-2">Beklenen Müşteri</h4>
                  <span className="text-5xl font-black text-ink drop-shadow-sm">{parsedAdvice.expected}</span>
                </div>
              )}

              {/* Yapılması Gerekenler Checklist */}
              {parsedAdvice.todos && (
                <div>
                  <h4 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
                    <span className="text-[#DE5E21]">📌</span> Yapılması Gerekenler
                  </h4>
                  <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
                    <div className="prose prose-sm max-w-none text-ink-muted leading-relaxed prose-li:marker:text-sage prose-li:my-1">
                      <SafeMarkdownLite source={parsedAdvice.todos} />
                    </div>
                  </div>
                </div>
              )}

              {/* Öneriler Alert Box */}
              {parsedAdvice.tips && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                   <h4 className="text-base font-bold text-amber-700 flex items-center gap-2 mb-2">
                     💡 Şef Önerileri & Uyarılar
                   </h4>
                   <div className="text-sm text-amber-900/80 leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                     <SafeMarkdownLite source={parsedAdvice.tips} />
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-ink-muted text-sm border border-dashed border-black/10 rounded-xl bg-black/5">
              <svg className="w-8 h-8 mx-auto text-sage/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p>Yapay Zeka Analizini (sol üstten) başlatarak güncel mutfak tavsiyenizi oluşturun.</p>
            </div>
          )}
        </SectionCard>
      </div>

    </div>

    {/* Email Settings Modal */}
    {showEmailModal && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95">
          <h3 className="text-lg font-bold text-ink mb-1">E-posta Ayarları</h3>
          <p className="text-sm text-ink-muted mb-4">
            n8n otomasyonu ve bildirimler için kullanılacak şef e-posta adresiniz.
          </p>
          <input
            type="email"
            placeholder="isim@restoran.com"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage mb-6"
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              İptal
            </button>
            <button 
              onClick={() => {
                const updated = tempEmail.trim();
                setChefEmail(updated);
                localStorage.setItem("restogen_chef_email", updated);
                setShowEmailModal(false);
              }}
              className="px-4 py-2 rounded-lg bg-sage hover:bg-[#204E41] text-white text-sm font-medium transition-colors shadow-sm"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
