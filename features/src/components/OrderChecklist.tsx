"use client";
import { useState, useEffect } from "react";

type OrderItem = {
  id: string;
  name: string;
  isAiSuggestion?: boolean;
  expectedArrival: string;
  completed: boolean;
};

const arrivalOptions = [
  "Belirtilmedi",
  "Hemen",
  "Bugün 12:00",
  "Bugün 16:00",
  "Yarın Sabah",
];

export function OrderChecklist({ aiWarnings = [] }: { aiWarnings?: string[] }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (aiWarnings.length > 0) {
      setItems((prev) => {
        const newItems = [...prev.filter(i => !i.isAiSuggestion)]; // Clear previous AI tips
        aiWarnings.forEach((warning, idx) => {
          newItems.push({
            id: `ai-${Date.now()}-${idx}`,
            name: warning,
            isAiSuggestion: true,
            expectedArrival: "Belirtilmedi",
            completed: false,
          });
        });
        return newItems;
      });
    }
  }, [aiWarnings]);

  const [newItemName, setNewItemName] = useState("");

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const updateTime = (id: string, time: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expectedArrival: time } : i))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name: newItemName.trim(),
        isAiSuggestion: false,
        expectedArrival: "Belirtilmedi",
        completed: false,
      },
    ]);
    setNewItemName("");
  };

  const aiItems = items.filter((i) => i.isAiSuggestion);
  const regularItems = items.filter((i) => !i.isAiSuggestion);

  return (
    <div className="flex flex-col gap-6">
      {/* AI Warnings Section */}
      {aiItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-red-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-semibold text-sm uppercase tracking-wide">AI Uyarıları (Sipariş Etme)</h3>
          </div>
          <ul className="space-y-3">
            {aiItems.map((item) => (
              <li
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-white p-3 shadow-sm transition-opacity ${
                  item.completed ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-1 items-start sm:items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id)}
                    className="mt-1 sm:mt-0 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span className={`text-sm font-medium text-ink ${item.completed ? "line-through text-ink-muted" : ""}`}>
                    {item.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Manual Orders Section */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sage">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="font-semibold text-sm uppercase tracking-wide">Şefin Sipariş Listesi</h3>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Eksik ürünleri buraya yazın..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 rounded-lg border border-black/10 px-4 py-2 text-sm text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="rounded-lg bg-[#DE5E21] hover:bg-[#C05621] px-4 py-2 text-sm font-medium text-cream shadow-sm disabled:opacity-50 transition-colors focus-ring"
          >
            Ekle
          </button>
        </form>

        <ul className="space-y-3">
          {regularItems.map((item) => (
            <li
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-black/5 bg-white p-3 shadow-sm transition-all ${
                item.completed ? "opacity-60 bg-gray-50/50" : ""
              }`}
            >
              <div className="flex flex-1 items-start sm:items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item.id)}
                  className="mt-1 sm:mt-0 h-5 w-5 rounded border-gray-300 text-sage focus:ring-sage cursor-pointer"
                />
                <span className={`text-sm font-medium text-ink flex-1 ${item.completed ? "line-through text-ink-muted" : ""}`}>
                  {item.name}
                </span>
              </div>
              
              <div className="ml-8 sm:ml-0 flex-shrink-0">
                <select
                  value={item.expectedArrival}
                  onChange={(e) => updateTime(item.id, e.target.value)}
                  disabled={item.completed}
                  className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-ink-muted shadow-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage disabled:opacity-50"
                >
                  {arrivalOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
          {regularItems.length === 0 && (
            <p className="text-sm text-ink-muted italic py-2 text-center">Şu an listede ürün yok.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
