export async function geocodeLocation(location: {
  city?: string;
  state?: string;
  country?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const { city, state, country } = location;
  const query = [city, state, country].filter(Boolean).join(", ");

  if (!query) return null;

  try {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, state, country }),
    });

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.success) {
      return { lat: data.lat, lng: data.lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}