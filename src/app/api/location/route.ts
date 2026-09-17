import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rateLimit";

const CSC_BASE_URL = "https://api.countrystatecity.in/v1";
const codePattern = /^[A-Z]{2,3}$/i;

export async function GET(request: NextRequest) {
  if (isRateLimited(request, "location", 40)) {
    return NextResponse.json({ error: "Too many location requests. Please try again shortly." }, { status: 429 });
  }

  const apiKey = process.env.LOCATION_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Location service is not configured." }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const state = searchParams.get("state");
  let path = "/countries";

  if (country) {
    if (!codePattern.test(country)) return NextResponse.json({ error: "Invalid country." }, { status: 400 });
    path = `/countries/${encodeURIComponent(country.toUpperCase())}/states`;
  }
  if (state) {
    if (!country || !codePattern.test(state)) return NextResponse.json({ error: "Invalid state." }, { status: 400 });
    path += `/${encodeURIComponent(state.toUpperCase())}/cities`;
  }

  try {
    const response = await fetch(`${CSC_BASE_URL}${path}`, {
      headers: { "X-CSCAPI-KEY": apiKey },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) return NextResponse.json({ error: "Unable to load location data." }, { status: response.status });
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({ error: "Unable to load location data." }, { status: 502 });
  }
}
