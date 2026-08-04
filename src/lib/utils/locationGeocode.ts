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

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Try Google Maps Geocoding API first
  if (googleKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleKey}`
      );
      const data = await response.json();
      const result = data?.results?.[0]?.geometry?.location;
      if (result?.lat != null && result?.lng != null) {
        return { lat: Number(result.lat), lng: Number(result.lng) };
      }
    } catch (error) {
      console.warn("Google geocoding failed, falling back to Nominatim", error);
    }
  }

  // Fallback to Nominatim (OpenStreetMap)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    if (Array.isArray(data) && data[0]) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding failed", error);
  }

  return null;
}