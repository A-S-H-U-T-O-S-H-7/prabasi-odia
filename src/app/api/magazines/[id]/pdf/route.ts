export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return new Response('Invalid magazine ID', { status: 400 });

  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const source = new URL(request.url).searchParams.get('url');
  if (!bucket || !source) return new Response('Magazine PDF URL is missing', { status: 400 });

  let pdfUrl: URL;
  try {
    pdfUrl = new URL(source);
  } catch {
    return new Response('Invalid magazine PDF URL', { status: 400 });
  }

  const objectPrefix = `/v0/b/${encodeURIComponent(bucket)}/o/`;
  let objectPath = '';
  try {
    objectPath = decodeURIComponent(pdfUrl.pathname.slice(objectPrefix.length));
  } catch {
    return new Response('Invalid magazine PDF URL', { status: 400 });
  }
  if (
    pdfUrl.protocol !== 'https:' ||
    pdfUrl.hostname !== 'firebasestorage.googleapis.com' ||
    !pdfUrl.pathname.startsWith(objectPrefix) ||
    objectPath !== `magazines/${id}/issue.pdf` ||
    !pdfUrl.searchParams.get('token')
  ) {
    return new Response('Invalid magazine PDF URL', { status: 400 });
  }

  try {
    const range = request.headers.get('range');
    const response = await fetch(pdfUrl, {
      headers: range ? { Range: range } : undefined,
      cache: 'no-store',
    });
    if (!response.ok || !response.body) {
      return new Response('Magazine PDF is unavailable', { status: response.status || 502 });
    }

    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    for (const header of ['content-length', 'content-range', 'accept-ranges']) {
      const value = response.headers.get(header);
      if (value) headers.set(header, value);
    }
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error('Magazine PDF download failed:', error);
    return new Response('Could not load magazine PDF', { status: 502 });
  }
}
