# RestoGen AI (web)

PRD’deki dört ekranın MVP’si: **panel**, **görsel envanter**, **zero-waste tarif**, **tabak artığı**.

## Faz 0 kararları (tasks.md)

| Görev | Karar |
|-------|--------|
| **0.1** MVP kapsam | Dört modül birlikte (3.1–3.4). |
| **0.2** Ölçüm | Panelde 0–100 manuel risk skoru + yerel kayıt; hedef %20 notu metinde. |
| **0.3** Gemini | `GEMINI_API_KEY` sunucu ortamında; istemcide yok. |
| **0.4** Hava | [Open-Meteo](https://open-meteo.com/) — API anahtarı gerekmez. |
| **0.5** Takvim | `data/institution-calendar.json` statik format. |

## Kurulum

```bash
cd web
cp .env.example .env.local
# .env.local içine GEMINI_API_KEY=... ekleyin (Google AI Studio)

npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000) → `/dashboard`.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `GEMINI_API_KEY` | Evet (AI özellikleri için) | Google AI Studio API anahtarı |
| `GEMINI_MODEL` | Hayır | Varsayılan `gemini-1.5-pro` |

## Yayın (Faz 8)

Netlify / Lovable: **`web`** kökünü bağlayın, `npm run build` ve `GEMINI_API_KEY` ortam değişkenini tanımlayın.

## Bilinen kısıtlar

- Kamera: tarayıcı izni gerekir; HTTPS veya localhost önerilir.
- İlk analizlerde Gemini kotası / model adı hataları için hata mesajları kontrol edin.
