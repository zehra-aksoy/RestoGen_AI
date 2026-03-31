/**
 * Faz 0.2 — Aşırı hazırlık israfı hedefi (%20 azalma) için uygulama içi göstergeler.
 * MVP: manuel risk skoru + hedef çizgisi; ileride tarama/taban verileri bağlanabilir.
 */

export const WASTE_TARGET_PERCENT = 20;

export type WasteSnapshot = {
  /** 0–100, kullanıcı tahmini veya son analiz özeti */
  riskScore: number;
  updatedAt: string;
  note?: string;
};

const STORAGE_KEY = "restogen:waste-snapshot";

export function loadWasteSnapshot(): WasteSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WasteSnapshot;
    if (typeof parsed.riskScore !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWasteSnapshot(snapshot: WasteSnapshot): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
