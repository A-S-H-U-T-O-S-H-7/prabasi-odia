import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const required = ['requestTitle', 'helpType', 'location', 'situationMessage', 'contactName', 'contactPhone', 'accountEmail'] as const;
    if (required.some((field) => !String(payload[field] || '').trim())) {
      return NextResponse.json({ status: false, message: 'All urgent-help request details are required' }, { status: 400 });
    }

    const submittedOn = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date());
    const formData = new FormData();
    formData.append('request_title', String(payload.requestTitle).trim());
    formData.append('help_type', String(payload.helpType).trim());
    formData.append('location', String(payload.location).trim());
    formData.append('submitted_on', submittedOn);
    formData.append('situation_message', String(payload.situationMessage).trim());
    formData.append('contact_name', String(payload.contactName).trim());
    formData.append('contact_phone', String(payload.contactPhone).trim());
    formData.append('account_email', String(payload.accountEmail).trim());
    formData.append('attachments_html', String(payload.attachmentsHtml || 'No attachments'));
    formData.append('admin_panel_link', String(payload.adminPanelLink || ''));

    const response = await fetch('https://svsamiti.com/prabasiodia/help.php', {
      method: 'POST',
      headers: { Accept: '*/*', 'User-Agent': 'Prabasi-Odia/1.0' },
      body: formData,
      signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json().catch(() => null);
    const sent = response.ok && (data?.status === true || data?.success === true);
    return NextResponse.json(
      { status: sent, message: data?.message || (sent ? 'Admin notification sent successfully!' : 'Failed to notify admins') },
      { status: sent ? 200 : 502 },
    );
  } catch (error) {
    console.error('Urgent-help notification error:', error);
    return NextResponse.json({ status: false, message: 'Failed to notify admins' }, { status: 500 });
  }
}
