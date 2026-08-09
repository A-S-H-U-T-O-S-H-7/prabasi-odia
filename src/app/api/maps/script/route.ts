import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const libraries = searchParams.get('libraries') || 'places';
  
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
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