import { NextResponse } from 'next/server';
import { getDonationById } from '@/lib/services/donationServerService';

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

    const orderId = String(body.order_id).trim();
    const donation = await getDonationById(orderId);

    if (!donation) {
      return NextResponse.json(
        { status: false, errors: ['Donation record not found. Please submit the form again.'] },
        { status: 404 }
      );
    }

    if (donation.status === 'completed') {
      return NextResponse.json(
        { status: false, errors: ['This donation has already been completed.'] },
        { status: 409 }
      );
    }

    const requestedAmount = parseFloat(String(body.amount));
    if (Number.isNaN(requestedAmount) || Math.abs(donation.amount - requestedAmount) >= 0.01) {
      return NextResponse.json(
        { status: false, errors: ['Payment amount does not match the donation record.'] },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const payload = {
      order_id: orderId,
      amount: donation.amount.toFixed(2),
      name: donation.donorDetails?.name || String(body.name).trim(),
      email: (donation.donorDetails?.email || String(body.email)).trim().toLowerCase(),
      phone: (donation.donorDetails?.mobile || String(body.phone || '')).replace(/\D/g, ''),
      address:
        donation.donorDetails?.address ||
        String(body.address || 'Delhi, India').trim(),
      purpose: String(body.purpose || donation.purpose || 'donation').trim(),
      donor_type: String(body.donor_type || donation.donorType || 'indian').trim(),
      country: String(body.country || donation.donorDetails?.country || 'india').trim(),
      redirect_url: `${baseUrl}/api/payment/ccavenue-response`,
      cancel_url: `${baseUrl}/api/payment/ccavenue-cancel`,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    const response = await fetch('https://svsamiti.com/rajaparba/ccavenueRequest.php', {
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
