import { NextResponse } from 'next/server';
import {
  getDonationById,
  toPublicDonationView,
} from '@/lib/services/donationServerService';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const donation = await getDonationById(orderId);

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toPublicDonationView(donation),
    });
  } catch (error: any) {
    console.error('GET /api/donations/[orderId] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unable to load donation' },
      { status: 500 }
    );
  }
}
