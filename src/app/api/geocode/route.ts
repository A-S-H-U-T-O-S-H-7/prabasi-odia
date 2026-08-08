// app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { city, state, country } = await request.json();
    
    const query = [city, state, country].filter(Boolean).join(", ");
    if (!query) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // ✅ API key is on the server - NEVER exposed to browser
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    // Try Google Maps Geocoding API
    if (API_KEY) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`
        );
        const data = await response.json();
        const result = data?.results?.[0]?.geometry?.location;
        if (result?.lat != null && result?.lng != null) {
          return NextResponse.json({
            success: true,
            lat: Number(result.lat),
            lng: Number(result.lng),
          });
        }
      } catch (error) {
        console.warn("Google geocoding failed:", error);
      }
    }

    // Fallback to Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (Array.isArray(data) && data[0]) {
        return NextResponse.json({
          success: true,
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
        });
      }
    } catch (error) {
      console.error("Nominatim geocoding failed:", error);
    }

    return NextResponse.json({ 
      success: false, 
      error: "Could not find coordinates for this location" 
    }, { status: 404 });

  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Geocoding failed" 
    }, { status: 500 });
  }
}