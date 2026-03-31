import { NextResponse } from "next/server";
import { runTextPrompt } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { ingredients?: string };
    if (!body.ingredients?.trim()) {
      return NextResponse.json(
        { error: "Malzeme listesi gerekli." },
        { status: 400 },
      );
    }

    const prompt = `Artan şu malzemelerden sıfır-israf odaklı pratik bir yemek tarifi öner (Türk mutfağına yakın, restoran mutfağı ölçeği varsayılabilir).
Başlık, porsiyon, malzeme listesi, adım adım yapılış ve kısa güvenlik notu (alerjen vb.) ekle.
Metin formatı markdown başlıkları kullan (##, ###, madde işaretleri).

Malzemeler: ${body.ingredients.trim()}`;

    const text = await runTextPrompt(prompt);
    return NextResponse.json({ markdown: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
