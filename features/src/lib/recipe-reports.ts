export type RecipeReport = {
  id: string;
  createdAt: string;
  summary: string;
  note: string;
};

const KEY = "restogen:recipe-reports";

export function loadRecipeReports(): RecipeReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as RecipeReport[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveRecipeReport(entry: Omit<RecipeReport, "id" | "createdAt">): RecipeReport {
  const list = loadRecipeReports();
  const row: RecipeReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  list.unshift(row);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  return row;
}
