import type { WeatherSummary } from "./openmeteo";
import { getActiveCalendarContext } from "./calendar";

export type PrepAdvice = {
  headline: string;
  lines: string[];
  source: "rules" | "rules+calendar+weather";
};

function weatherLine(w: WeatherSummary, label: string): string {
  const rain = w.precipitationMm > 0.5;
  return `${label}: ${w.temperatureC.toFixed(0)}°C, ${rain ? "yağışlı — paket servis / iç mekan talebi artabilir" : "kurak görünüm"}.`;
}

export function buildPrepAdvice(
  weather: WeatherSummary | null,
  date = new Date(),
): PrepAdvice {
  const { period, specialDay, closed } = getActiveCalendarContext(date);
  const lines: string[] = [];

  if (closed) {
    return {
      headline: "Kapanış günü",
      lines: ["Takvimde bugün kapalı. Hazırlık planınızı buna göre düzenleyin."],
      source: "rules+calendar+weather",
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
    }
    if (weather.temperatureC <= 5) {
      lines.push("Soğuk hava: sıcak çorba / ana yemek talebi artabilir.");
    }
  } else {
    lines.push("Hava verisi yok — konum izni veya manuel şehir seçimi ile doldurulabilir.");
  }

  if (lines.length === 0) {
    lines.push("Bugün için özel takvim uyarısı yok; standart porsiyon planını kullanın.");
  }

  return {
    headline: "Hazırlık tavsiyesi",
    lines,
    source: weather ? "rules+calendar+weather" : "rules",
  };
}
