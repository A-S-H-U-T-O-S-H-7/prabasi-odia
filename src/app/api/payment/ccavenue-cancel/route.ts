import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: false, message: 'Payment cancelled' }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ status: false, message: 'Payment cancelled' }, { status: 200 });
}
