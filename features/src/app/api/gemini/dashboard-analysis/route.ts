import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const responseSchema = z.object({
  riskScore: z.number().describe("0 ile 100 arasında güncel israf riski yüzdesi."),
  analysisSummary: z.string().describe("Analiz sonuçlarının şefe hitap eden tek cümlelik özet metni. Kayda değer bir değişiklik varsa geçmiş skorlara atıfta bulunabilir."),
  donotOrderList: z.array(z.string()).describe("Siparişi iptal edilmesi veya alınmaması gereken malzemeler.")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings, expectedCustomers, plateWastePercent, weather, history, chefEmail } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI API KEY MISSING in .env" },
        { status: 500 }
      );
    }

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
    });

    const structuredLlm = model.withStructuredOutput(responseSchema);

    // Prepare history strings (Özet Geçmiş)
    let historyText = "Geçmiş analiz verisi yok.";
    if (history && Array.isArray(history) && history.length > 0) {
      // Sadece son 5 özet context window'u doldurmayacak kısalıkta
      historyText = history.map((h: { date: string, riskScore: number, summary: string }) => `${h.date} - Skor: ${h.riskScore}, Özet: ${h.summary}`).join("\n");
    }

    const promptTemplate = PromptTemplate.fromTemplate(`Sen usta bir sürdürülebilirlik şefisin. Gelen tüm verileri (hava, etkinlik, atık, müşteri) harmanla. Çıktıyı MUTLAKA istenen JSON formatında ver.
Geçmiş analizlere bakarak bugünkü durumun düne göre nasıl değiştiğini (Örn: 'Dünkü risk puanın 40'tı, bugün 85'e çıktı çünkü...') gerektiğinde özet cümlende belirtebilirsin.
Bugün 30 Mart 2026. Yarın 31 Mart'ta Türkiye-Kosova maçı var. Nisan boyu Lale Festivali kutlanacak. 23 Nisan Çocuk Bayramı yaklaşıyor.

Geçmiş Analiz Özeti (Son 5 Veri):
{historyText}

Gelen Güncel Veriler:
- Restoran Ayarları:
  - İsim/Unvan: {name}
  - İşletme Adı: {businessName}
  - Şehir: {city}
  - Kapasite: {capacity}
  - Şefin Notu: {chefNote}
- Beklenen Müşteri Sayısı: {expectedCustomers}
- Dönen Tabak Atığı (%): {plateWastePercent}
- Hava Durumu: {weather}

Not: Girdi verilerini analiz ederek en uygun "riskScore", durumu anlatan akılda kalıcı tek cümle "analysisSummary" ve israf olmaması için kesinlikle sipariş edilmemesi ("donotOrderList") gereken şeyleri çıkar.`);

    const weatherText = weather
      ? `${weather.temperatureC}°C, Yağış: ${weather.precipitationMm}mm, Kod: ${weather.code}`
      : "Alınamadı";

    const promptValue = await promptTemplate.format({
      historyText,
      name: settings?.name || "Belirtilmedi",
      businessName: settings?.businessName || "Belirtilmedi",
      city: settings?.city || "Belirtilmedi",
      capacity: settings?.capacity || "Belirtilmedi",
      chefNote: settings?.chefNote || "Yok",
      expectedCustomers: expectedCustomers ?? "Belirtilmedi",
      plateWastePercent: plateWastePercent ?? "Belirtilmedi",
      weather: weatherText,
    });

    const parsed = await structuredLlm.invoke(promptValue);

    // Call N8N Webhook if risk > 75
    if (parsed.riskScore > 75) {
      try {
        await fetch("https://zehraaksoy.app.n8n.cloud/webhook/Restogen-aı", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chefEmail: chefEmail || "varsayilan@test.com",
            chefName: settings?.name || "Şef Sibel",
            riskScore: parsed.riskScore,
            summary: parsed.analysisSummary
          })
        });
        console.log("n8n Webhook başarıyla tetiklendi.");
      } catch (err) {
        // Hata Yönetimi: Tüm süreci durdurma, sadece konsola hata bas
        console.error("n8n Webhook çağrısı başarısız oldu:", err);
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    console.error("Gemini dashboard analysis error:", errObj);
    return NextResponse.json(
      { error: errObj.message || "Failed to analyze data" },
      { status: 500 }
    );
  }
}
