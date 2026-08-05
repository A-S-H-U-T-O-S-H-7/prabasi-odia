// app/api/payment/donation-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { donationService } from '@/lib/services/donationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get('donationId');

    if (!donationId) {
      return NextResponse.json({
        success: false,
        message: 'Donation ID is required'
      }, { status: 400 });
    }

    const result = await donationService.getDonation(donationId);
    
    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Donation not found'
      }, { status: 404 });
    }

    // ✅ Safe access with optional chaining and nullish coalescing
    const donation = result.data;
    const donorDetails = donation.donorDetails || {};

    return NextResponse.json({
      success: true,
      data: {
        id: donationId,
        status: donation.status || 'unknown',
        amount: donation.amount || 0,
        donorName: donorDetails.name || 'N/A',
        email: donorDetails.email || 'N/A',
        createdAt: donation.createdAt || null,
        updatedAt: donation.updatedAt || null,
        transactionId: donation.transactionId || null,
        paymentDetails: donation.paymentDetails || null,
      }
    });

  } catch (error: any) {
    console.error('Donation status error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get donation status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json({
        success: false,
        message: 'Donation ID is required'
      }, { status: 400 });
    }

    const result = await donationService.getDonation(donationId);
    
    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Donation not found'
      }, { status: 404 });
    }

    // ✅ Safe access with optional chaining and nullish coalescing
    const donation = result.data;
    const donorDetails = donation.donorDetails || {};

    return NextResponse.json({
      success: true,
      data: {
        id: donationId,
        status: donation.status || 'unknown',
        amount: donation.amount || 0,
        donorName: donorDetails.name || 'N/A',
        email: donorDetails.email || 'N/A',
        createdAt: donation.createdAt || null,
        updatedAt: donation.updatedAt || null,
        transactionId: donation.transactionId || null,
        paymentDetails: donation.paymentDetails || null,
      }
    });

  } catch (error: any) {
    console.error('Donation status error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get donation status'
    }, { status: 500 });
  }
}