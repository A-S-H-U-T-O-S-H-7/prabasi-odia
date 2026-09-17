export interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeLocation(location: {
  city?: string;
  state?: string;
  country?: string;
}): Promise<GeocodeResult | null> {
  const { city, state, country } = location;
  const query = [city, state, country].filter(Boolean).join(", ");

  if (!query) {
    return null;
  }

  try {
    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, state, country }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = await response.json();
    if (data.success && data.lat != null && data.lng != null) return { lat: Number(data.lat), lng: Number(data.lng) };
  } catch (error) {
    console.error("Geocoding failed", error);
  }

  return null;
}
