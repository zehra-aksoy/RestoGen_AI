export type InventoryReport = {
  id: string;
  createdAt: string;
  summary: string;
  note: string;
};

const KEY = "restogen:inventory-reports";

export function loadInventoryReports(): InventoryReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as InventoryReport[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveInventoryReport(entry: Omit<InventoryReport, "id" | "createdAt">): InventoryReport {
  const list = loadInventoryReports();
  const row: InventoryReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  list.unshift(row);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  return row;
}
