import { OrderChecklist } from "@/components/OrderChecklist";

export const metadata = {
  title: "Sipariş Listesi | RestoGen AI",
  description: "AI destekli mutfak sipariş kontrol paneli.",
};

export default function SiparisPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">
            Sipariş Listesi
          </h1>
          <p className="mt-2 text-ink-muted leading-relaxed">
            Gemini yapay zeka analizleri ve güncel tüketim verileri doğrultusunda akıllı sipariş listenizi yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span>
          </span>
          <span className="text-sm font-medium text-sage">AI Analizi Aktif</span>
        </div>
      </div>
      
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-black/[0.03]">
        <OrderChecklist />
      </div>
    </div>
  );
}
