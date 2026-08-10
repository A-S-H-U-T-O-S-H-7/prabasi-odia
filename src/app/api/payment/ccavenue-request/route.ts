import { NextResponse } from 'next/server';

type Body = {
  order_id?: string;
  purpose?: string;
  amount?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  donor_type?: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    const required = ['order_id', 'amount', 'name', 'email'];
    const missing = required.filter((key) => {
      const value = body[key as keyof Body];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return NextResponse.json(
        { status: false, errors: [`Missing fields: ${missing.join(', ')}`] },
        { status: 400 }
      );
    }

    const payload = {
      order_id: String(body.order_id).trim(),
      amount: parseFloat(String(body.amount)).toFixed(2),
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || '').replace(/\D/g, ''),
      address: String(body.address || 'Delhi, India').trim(),
      purpose: String(body.purpose || 'donation').trim(),
      donor_type: String(body.donor_type || 'indian').trim(),
      country: String(body.country || 'india').trim(),
      redirect_url: 'https://prabasiodia.svsamiti.com/api/payment/ccavenue-response',
      cancel_url: 'https://prabasiodia.svsamiti.com/api/payment/ccavenue-cancel',
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    const response = await fetch('https://svsamiti.com/prabasiodia/ccavenueRequest.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`CCAvenue request endpoint returned ${response.status}`);
    }

    const text = await response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      status: parsed.status ?? true,
      encRequest: parsed.encRequest,
      access_code: parsed.access_code,
      order_id: parsed.order_id || payload.order_id,
    });
  } catch (error: any) {
    console.error('ccavenue-request error:', error);
    return NextResponse.json(
      { status: false, errors: [error.message || 'Internal server error'] },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: false, errors: ['Use POST'] }, { status: 405 });
}
