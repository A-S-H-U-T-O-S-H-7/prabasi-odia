import { NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = new Set(["hi", "or"]);
const MAX_TEXTS_PER_REQUEST = 75;
const MAX_TEXT_LENGTH = 4_500;
const MAX_TOTAL_TEXT_LENGTH = 20_000;

export async function POST(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Translate API key is not configured." }, { status: 500 });
  } 

  try {
    const body = (await request.json()) as { target?: string; texts?: unknown };
    if (!SUPPORTED_LANGUAGES.has(body.target ?? "") || !Array.isArray(body.texts)) {
      return NextResponse.json({ error: "Invalid translation request." }, { status: 400 });
    }

    const texts = body.texts.filter(
      (text): text is string => typeof text === "string" && text.length > 0 && text.length <= MAX_TEXT_LENGTH
    );
    const totalTextLength = texts.reduce((total, text) => total + text.length, 0);
    if (
      texts.length !== body.texts.length ||
      texts.length > MAX_TEXTS_PER_REQUEST ||
      totalTextLength > MAX_TOTAL_TEXT_LENGTH
    ) {
      return NextResponse.json({ error: "Translation request is too large." }, { status: 400 });
    }

    const endpoint = new URL("https://translation.googleapis.com/language/translate/v2");
    endpoint.searchParams.set("key", apiKey);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, source: "en", target: body.target, format: "text" }),
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Google Cloud Translation API error:", details);
      return NextResponse.json(
        { error: "Google Cloud Translation request failed.", details },
        { status: response.status }
      );
    }

    const result = (await response.json()) as { data?: { translations?: { translatedText?: string }[] } };
    const translations = result.data?.translations?.map((item) => item.translatedText ?? "") ?? [];
    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation endpoint error:", error);
    return NextResponse.json({ error: "Unable to process translation request." }, { status: 500 });
  }
}
