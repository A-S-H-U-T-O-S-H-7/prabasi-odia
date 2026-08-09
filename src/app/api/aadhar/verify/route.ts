// app/api/aadhar/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { aadharno } = await request.json();

    if (!aadharno || aadharno.length !== 12) {
      return NextResponse.json(
        { success: false, message: 'Valid 12-digit Aadhar number is required' },
        { status: 400 }
      );
    }

    // ✅ Server-side request (no CORS issues)
    const response = await fetch('https://svsamiti.com/prabasiodia/aadhar.php', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Prabasi-Odia/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aadharno }),
    });

    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Aadhar verification failed',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Aadhar verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify Aadhar' },
      { status: 500 }
    );
  }
}