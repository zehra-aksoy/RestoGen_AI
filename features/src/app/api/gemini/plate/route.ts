import { NextResponse } from "next/server";
import { runVisionJsonPrompt } from "@/lib/gemini";
import { extractJsonArrayOrObject } from "@/lib/parse-ai-json";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT = `Tabakta veya tepside kalan yemek görüntüsünü analiz et. Tahmini tüketilmemiş yüzde veya bölüm, yemek türü tahmini ve kısa aksiyon önerisi ver.
Yanıtını YALNIZCA geçerli JSON olarak ver. Şema:
{"estimatedWastePercent":number,"foodType":"string","notes":"string","suggestedActions":["string"]}
estimatedWastePercent 0-100 arası kabaca tahmin. Türkçe kullan.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!body.imageBase64 || !body.mimeType) {
      return NextResponse.json(
        { error: "imageBase64 ve mimeType gerekli." },
        { status: 400 },
      );
    }

    const text = await runVisionJsonPrompt({
      prompt: PROMPT,
      mimeType: body.mimeType,
      base64: body.imageBase64,
    });

    const jsonStr = extractJsonArrayOrObject(text);
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
