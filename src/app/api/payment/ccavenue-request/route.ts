import { NextResponse } from 'next/server';

type Body = {
  order_id?: string;
  purpose?: string;
  amount?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  donor_type?: string;
  country?: string;
};

function generateMockEncRequest(payload: Body) {
  const str = JSON.stringify({ payload, ts: Date.now() });
  return Buffer.from(str).toString('base64');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    // Basic validation
    const required = ['order_id', 'amount', 'name', 'email'];
    const missing = required.filter((k) => !body[k as keyof Body]);
    if (missing.length > 0) {
      return NextResponse.json({ status: false, errors: [`Missing fields: ${missing.join(', ')}`] }, { status: 400 });
    }

    // In production this handler should call your CC Avenue integration or server-side SDK.
    // For local development we return a mock encrypted request and an access code.
    const encRequest = generateMockEncRequest(body);
    const access_code = process.env.CCAVENUE_ACCESS_CODE || process.env.NEXT_PUBLIC_CCAVENUE_ACCESS_CODE || 'TEST_ACCESS_CODE';

    return NextResponse.json({ status: true, encRequest, access_code });
  } catch (err) {
    console.error('ccavenue-request error:', err);
    return NextResponse.json({ status: false, errors: ['Internal server error'] }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: false, errors: ['Use POST'] }, { status: 405 });
}
