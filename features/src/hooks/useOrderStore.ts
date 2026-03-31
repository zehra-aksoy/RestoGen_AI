import { useState, useEffect, useCallback } from "react";

export type OrderItem = {
  id: string;
  name: string;
  isAiSuggestion?: boolean;
  expectedArrival: string;
  completed: boolean;
};

const STORAGE_KEY = "restogen_order_list";

export function useOrderStore() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initial Load from LocalStorage
  const load = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Order store parse error:", e);
    }
  }, []);

  useEffect(() => {
    load();
    setIsHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        load();
      }
    };

    const handleCustomChange = () => {
      load();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("restogen_order_updated", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("restogen_order_updated", handleCustomChange);
    };
  }, [load]);

  const save = useCallback((newItems: OrderItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event("restogen_order_updated"));
  }, []);

  // Update AI Warnings
  const syncAiWarnings = useCallback(
    (aiWarnings: string[]) => {
      if (aiWarnings.length === 0) return;

      setItems((prev) => {
        const regularItems = prev.filter((i) => !i.isAiSuggestion);
        // We only add new warnings if they are different from existing warnings
        // Or we just recreate AI items every time AI runs
        const newAiItems = aiWarnings.map((warning, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          name: warning,
          isAiSuggestion: true,
          expectedArrival: "Belirtilmedi",
          completed: false,
        }));
        const newMerged = [...regularItems, ...newAiItems];
        save(newMerged);
        return newMerged;
      });
    },
    [save]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, completed: !i.completed } : i
        );
        save(next);
        return next;
      });
    },
    [save]
  );

  const updateTime = useCallback(
    (id: string, time: string) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, expectedArrival: time } : i
        );
        save(next);
        return next;
      });
    },
    [save]
  );

  const addManualItem = useCallback(
    (name: string) => {
      setItems((prev) => {
        const next = [
          ...prev,
          {
            id: `manual-${Date.now()}`,
            name,
            isAiSuggestion: false,
            expectedArrival: "Belirtilmedi",
            completed: false,
          },
        ];
        save(next);
        return next;
      });
    },
    [save]
  );

  return {
    items,
    isHydrated,
    syncAiWarnings,
    toggleComplete,
    updateTime,
    addManualItem,
  };
}
