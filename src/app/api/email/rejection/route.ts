import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const applicationId = String(payload.applicationId || '').trim();
    const rejectionReason = String(payload.rejectionReason || '').trim();
    const communityName = String(payload.communityName || 'Prabasi Odia Community').trim();

    if (!name || !email || !applicationId || !rejectionReason) {
      return NextResponse.json({ status: false, message: 'Name, email, application ID, and rejection reason are required' }, { status: 400 });
    }

    const reviewedDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date());
    const formData = new FormData();
    formData.append('user_name', name);
    formData.append('email', email);
    formData.append('application_id', applicationId);
    formData.append('rejection_reason', rejectionReason);
    formData.append('reviewed_date', reviewedDate);
    formData.append('community_name', communityName);

    const response = await fetch('https://svsamiti.com/prabasiodia/rejection.php', {
      method: 'POST',
      headers: { Accept: '*/*', 'User-Agent': 'Prabasi-Odia/1.0' },
      body: formData,
      signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json().catch(() => null);
    const sent = response.ok && (data?.status === true || data?.success === true);
    return NextResponse.json(
      { status: sent, message: data?.message || (sent ? 'Rejection email sent successfully!' : 'Failed to send rejection email') },
      { status: sent ? 200 : 502 },
    );
  } catch (error) {
    console.error('Rejection email error:', error);
    return NextResponse.json({ status: false, message: 'Failed to send rejection email' }, { status: 500 });
  }
}
