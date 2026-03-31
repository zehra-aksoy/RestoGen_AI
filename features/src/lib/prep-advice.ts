import type { WeatherSummary } from "./openmeteo";
import { getActiveCalendarContext } from "./calendar";

export type PrepAdvice = {
  headline: string;
  lines: string[];
  source: "rules" | "rules+calendar+weather";
  multiplier: number;
};

function weatherLine(w: WeatherSummary, label: string): string {
  const rain = w.precipitationMm > 0.5;
  return `${label}: ${w.temperatureC.toFixed(0)}°C, ${rain ? "yağışlı — paket servis / iç mekan talebi artabilir" : "kurak görünüm"}.`;
}

export function buildPrepAdvice(
  weather: WeatherSummary | null,
  date: Date = new Date(),
  riskScore: number = 0,
): PrepAdvice {
  const { period, specialDay, closed } = getActiveCalendarContext(date);
  const lines: string[] = [];

  if (closed) {
    return {
      headline: "Kapanış günü",
      lines: ["Takvimde bugün kapalı. Hazırlık planınızı buna göre düzenleyin."],
      source: "rules+calendar+weather",
      multiplier: 0,
    };
  }

  if (period) {
    lines.push(`${period.label}: ${period.note}`);
  }
  if (specialDay) {
    lines.push(`${specialDay.label}: ${specialDay.note}`);
  }

  let mult = 1;
  if (period) mult *= period.prepMultiplier;
  if (specialDay) mult *= specialDay.prepMultiplier;
  if (mult !== 1) {
    lines.push(
      `Tahmini hazırlık çarpanı (takvim): ×${mult.toFixed(2)} — porsiyon ve stok buna yaklaştırılabilir.`,
    );
  }

  if (weather) {
    lines.push(weatherLine(weather, "Hava"));
    if (weather.temperatureC >= 28) {
      lines.push("Sıcak hava: soğuk içecek ve hafif menü talebi artabilir.");
      mult *= 1.1; // Example multiplier logic based on heat
    }
    if (weather.temperatureC <= 5) {
      lines.push("Soğuk hava: sıcak çorba / ana yemek talebi artabilir.");
      mult *= 1.1;
    }
    if (weather.precipitationMm > 0.5) {
      mult *= 0.8; // Example: people might not go out if it rains
    }
  } else {
    lines.push("Hava verisi yok — konum izni veya manuel şehir seçimi ile doldurulabilir.");
  }

  if (riskScore > 75) {
    lines.push("⚠️ DİKKAT: Yapay Zeka güncel israf riskini yüksek (% " + riskScore + ") öngörüyor. Hazırlanacak porsiyon / açık büfe miktarını acilen küçültün.");
  } else if (riskScore > 40) {
    lines.push("ℹ️ Bilgi: İsraf riski orta seviyede (% " + riskScore + "). Standart veya biraz daha kısıntılı porsiyonlama yapabilirsiniz.");
  }

  if (lines.length === 0) {
    lines.push("Bugün için özel takvim uyarısı yok; standart porsiyon planını kullanın.");
  }

  return {
    headline: "Hazırlık tavsiyesi",
    lines,
    source: weather ? "rules+calendar+weather" : "rules",
    multiplier: mult,
  };
}
