/** Faz 7.3 — Tabak artığı kayıtları yalnızca tarayıcıda (localStorage); sunucuda görüntü saklanmaz. */

export type PlateReport = {
  id: string;
  createdAt: string;
  summary: string;
  note: string;
};

const KEY = "restogen:plate-reports";

export function loadPlateReports(): PlateReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as PlateReport[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function savePlateReport(entry: Omit<PlateReport, "id" | "createdAt">): PlateReport {
  const list = loadPlateReports();
  const row: PlateReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  list.unshift(row);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  return row;
}
