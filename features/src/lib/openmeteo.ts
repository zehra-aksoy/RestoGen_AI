/** Faz 0.4 — Open-Meteo: API anahtarı gerektirmez (ücretsiz, makul kota). */

export type WeatherSummary = {
  temperatureC: number;
  precipitationMm: number;
  code: number;
  fetchedAt: string;
};

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function fetchWeatherSummary(
  latitude: number,
  longitude: number,
): Promise<WeatherSummary> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,precipitation,weather_code",
    timezone: "auto",
  });

  const res = await fetch(`${WEATHER_URL}?${params.toString()}`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Hava verisi alınamadı (${res.status})`);
  }

  return parseOpenMeteoBody(await res.json());
}

/** İstemci tarafında (tarayıcı) kullanın; sunucu önbelleği yok. */
export async function fetchWeatherClient(
  latitude: number,
  longitude: number,
): Promise<WeatherSummary> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,precipitation,weather_code",
    timezone: "auto",
  });

  const res = await fetch(`${WEATHER_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Hava verisi alınamadı (${res.status})`);
  }
  return parseOpenMeteoBody(await res.json());
}

function parseOpenMeteoBody(body: {
  current: {
    time: string;
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
  };
}): WeatherSummary {
  return {
    temperatureC: body.current.temperature_2m,
    precipitationMm: body.current.precipitation,
    code: body.current.weather_code,
    fetchedAt: body.current.time,
  };
}

export function weatherCodeLabel(code: number): string {
  // WMO weather interpretation codes (Open-Meteo) — kısaltılmış
  if (code === 0) return "Açık";
  if (code <= 3) return "Parçalı bulutlu";
  if (code >= 51 && code <= 67) return "Yağmurlu";
  if (code >= 71 && code <= 77) return "Karlı";
  if (code >= 80) return "Sağanak";
  if (code >= 45 && code <= 48) return "Sisli";
  return "Değişken";
}

export type CityCoords = {
  latitude: number
  longitude: number
}

export async function geocodeCityToCoords(
  city: string,
): Promise<CityCoords | null> {
  const trimmed = city.trim()
  if (!trimmed) return null

  const params = new URLSearchParams({
    name: trimmed,
    count: "1",
    language: "tr",
    format: "json",
  })

  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Şehir konumu alınamadı (${res.status})`)
  }

  const body = (await res.json()) as {
    results?: Array<{
      latitude?: number
      longitude?: number
    }>
  }

  const first = body.results?.[0]
  if (!first) return null
  if (
    typeof first.latitude !== "number" ||
    typeof first.longitude !== "number"
  )
    return null

  return { latitude: first.latitude, longitude: first.longitude }
}
