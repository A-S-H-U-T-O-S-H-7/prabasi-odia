import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const required = ['posterEmail', 'posterName', 'jobTitle', 'companyName', 'jobLocation', 'applicantName', 'applicantEmail', 'applicantPhone'] as const;
    if (required.some((field) => !String(payload[field] || '').trim())) {
      return NextResponse.json({ status: false, message: 'Required job application details are missing' }, { status: 400 });
    }
    const appliedOn = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
    const formData = new FormData();
    formData.append('poster_email', String(payload.posterEmail).trim());
    formData.append('poster_name', String(payload.posterName).trim());
    formData.append('job_title', String(payload.jobTitle).trim());
    formData.append('company_name', String(payload.companyName).trim());
    formData.append('job_location', String(payload.jobLocation).trim());
    formData.append('applicant_name', String(payload.applicantName).trim());
    formData.append('applicant_email', String(payload.applicantEmail).trim());
    formData.append('applicant_phone', String(payload.applicantPhone).trim());
    formData.append('applied_on', appliedOn);
    formData.append('applicant_note', String(payload.applicantNote || ''));
    formData.append('resume_html', String(payload.resumeHtml || 'No resume attached'));
    const response = await fetch('https://svsamiti.com/prabasiodia/job-apply.php', {
      method: 'POST', headers: { Accept: '*/*', 'User-Agent': 'Prabasi-Odia/1.0' }, body: formData, signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json().catch(() => null);
    const sent = response.ok && (data?.status === true || data?.success === true);
    return NextResponse.json({ status: sent, message: data?.message || (sent ? 'Application notification sent successfully!' : 'Failed to notify the job poster') }, { status: sent ? 200 : 502 });
  } catch (error) {
    console.error('Job application notification error:', error);
    return NextResponse.json({ status: false, message: 'Failed to notify the job poster' }, { status: 500 });
  }
}
