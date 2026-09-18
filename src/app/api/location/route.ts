import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rateLimit";

const CSC_BASE_URL = "https://api.countrystatecity.in/v1";
const codePattern = /^[A-Z]{2,3}$/i;
// CSC uses numeric identifiers for some states (for example Sarawak = "13").
const stateIdentifierPattern = /^[A-Z0-9_-]{1,20}$/i;

type RestCountry = {
  name?: { common?: string };
  cca2?: string;
  idd?: { root?: string; suffixes?: string[] };
};

// Keeps the country and dialing-code pickers usable if the optional CSC
// provider is temporarily quota-limited. State/city data still comes from CSC.
const emergencyCountries = [
  ["AU", "Australia", "61"], ["AT", "Austria", "43"], ["BD", "Bangladesh", "880"], ["BE", "Belgium", "32"],
  ["BR", "Brazil", "55"], ["CA", "Canada", "1"], ["CN", "China", "86"], ["DK", "Denmark", "45"],
  ["FI", "Finland", "358"], ["FR", "France", "33"], ["DE", "Germany", "49"], ["GR", "Greece", "30"],
  ["HK", "Hong Kong", "852"], ["IN", "India", "91"], ["ID", "Indonesia", "62"], ["IE", "Ireland", "353"],
  ["IT", "Italy", "39"], ["JP", "Japan", "81"], ["KE", "Kenya", "254"], ["MY", "Malaysia", "60"],
  ["MX", "Mexico", "52"], ["NL", "Netherlands", "31"], ["NZ", "New Zealand", "64"], ["NG", "Nigeria", "234"],
  ["NO", "Norway", "47"], ["OM", "Oman", "968"], ["PK", "Pakistan", "92"], ["PH", "Philippines", "63"],
  ["PL", "Poland", "48"], ["PT", "Portugal", "351"], ["QA", "Qatar", "974"], ["RU", "Russia", "7"],
  ["SA", "Saudi Arabia", "966"], ["SG", "Singapore", "65"], ["ZA", "South Africa", "27"], ["KR", "South Korea", "82"],
  ["ES", "Spain", "34"], ["SE", "Sweden", "46"], ["CH", "Switzerland", "41"], ["TH", "Thailand", "66"],
  ["TR", "Turkey", "90"], ["AE", "United Arab Emirates", "971"], ["GB", "United Kingdom", "44"],
  ["US", "United States", "1"], ["VN", "Vietnam", "84"],
] as const;

function localCountryFallback() {
  return emergencyCountries.map(([iso2, name, phonecode]) => ({ id: iso2, iso2, name, phonecode }));
}

async function fallbackCountries() {
  const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd", {
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error("Country fallback failed");
  const countries = (await response.json()) as RestCountry[];
  return countries
    .filter((country) => country.name?.common && country.cca2)
    .map((country) => ({
      id: country.cca2!,
      name: country.name!.common!,
      iso2: country.cca2!,
      phonecode: country.idd?.root && country.idd.suffixes?.[0]
        ? `${country.idd.root}${country.idd.suffixes[0]}`.replace("+", "")
        : "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET(request: NextRequest) {
  if (isRateLimited(request, "location", 40)) {
    return NextResponse.json({ error: "Too many location requests. Please try again shortly." }, { status: 429 });
  }

  // The legacy name is read on the server only during migration, so existing
  // deployments keep working. Remove it from .env.local after rotating keys.
  const apiKey = process.env.LOCATION_API_KEY || process.env.NEXT_PUBLIC_LOCATION_API_KEY;
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
    if (!country || !stateIdentifierPattern.test(state)) return NextResponse.json({ error: "Invalid state." }, { status: 400 });
    path += `/${encodeURIComponent(state.toUpperCase())}/cities`;
  }

  try {
    const response = await fetch(`${CSC_BASE_URL}${path}`, {
      headers: { "X-CSCAPI-KEY": apiKey },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) {
      // A quota-exhausted CSC key should not break account/contact forms. Only
      // countries can be served independently; states and cities need CSC.
      if (response.status === 429 && !country) {
        try {
          const countries = await fallbackCountries();
          return NextResponse.json(countries, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
        } catch {
          return NextResponse.json(localCountryFallback(), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
        }
      }
      return NextResponse.json({ error: "Unable to load location data." }, { status: response.status });
    }
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({ error: "Unable to load location data." }, { status: 502 });
  }
}
