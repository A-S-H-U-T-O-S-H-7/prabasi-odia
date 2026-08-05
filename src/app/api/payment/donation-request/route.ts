// app/api/payment/donation-request/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      order_id, 
      purpose, 
      amount, 
      name, 
      email, 
      phone, 
      address, 
      donor_type,
      country 
    } = body;

    // ✅ Validation
    const errors: string[] = [];
    
    if (!order_id || order_id.trim().length === 0) {
      errors.push('Order ID is required');
    }
    
    if (!purpose || purpose.trim().length === 0) {
      errors.push('Purpose is required');
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.push('Valid amount is required');
    }
    
    if (!name || name.trim().length < 2) {
      errors.push('Donor name must be at least 2 characters');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email address is required');
    }
    
    if (!phone || !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.push('Valid 10-digit phone number is required');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        status: false,
        message: 'Validation failed',
        errors: errors
      }, { status: 400 });
    }

    // ✅ Prepare payment data for CCAvenue
    const paymentData = {
      order_id: order_id.trim(),
      purpose: purpose.trim(),
      amount: parseFloat(amount).toFixed(2),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''),
      address: (address || 'Delhi, India').trim(),
      donor_type: donor_type || 'indian',
      country: country || 'india',
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/donation-response`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/donation-cancel`,
    };

    // ✅ Call CCAvenue API
    const response = await fetch(`${process.env.CCAVENUE_REQUEST_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Prabasi-Odia-Donation/1.0',
      },
      body: new URLSearchParams(paymentData)
    });

    if (!response.ok) {
      throw new Error(`CCAvenue API returned status ${response.status}`);
    }

    const data = await response.json();

    // ✅ Return the response
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Donation payment request error:', error);
    return NextResponse.json({
      status: false,
      message: 'Payment request failed',
      errors: [error.message || 'Internal server error']
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: false, 
    message: 'Method not allowed. Only POST requests are accepted.' 
  }, { status: 405 });
}