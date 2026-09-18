import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/security/rateLimit';

const allowedLibraries = new Set(['places', 'marker', 'maps', 'geometry']);

export async function GET(request: NextRequest) {
  if (isRateLimited(request, 'maps-script', 10)) {
    return new NextResponse('Too many map requests. Please try again shortly.', { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const libraries = (searchParams.get('libraries') || 'places').split(',').filter((library) => allowedLibraries.has(library)).join(',') || 'places';
  
  // The Maps JavaScript API requires its key in the browser-delivered script.
  // Use a separate key restricted by HTTP referrer and Maps JavaScript API only.
  const API_KEY = process.env.GOOGLE_MAPS_BROWSER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    return new NextResponse('API key missing', { status: 500 });
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=${libraries}&loading=async`
  );

  const scriptContent = await response.text();

  return new NextResponse(scriptContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
