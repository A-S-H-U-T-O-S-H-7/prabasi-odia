import axios from 'axios';
import { coerceDate } from './memberCardData';

const ENDPOINT = 'https://svsamiti.com/prabasiodia/verification.php';

interface VerificationFields {
  name: string;
  email: string;
  memberId: string;
  memberSince: unknown;
  communityName: string;
}

export function createVerificationForm(fields: VerificationFields, pdf: Buffer): FormData {
  if (pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('Member-card generation did not return a valid PDF.');
  }
  const date = coerceDate(fields.memberSince);
  if (!date) throw new Error('The membership date is invalid.');
  const memberSince = [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()]
    .map((value) => String(value).padStart(2, '0')).join('-');
  const form = new FormData();
  form.append('name', fields.name);
  form.append('email', fields.email);
  form.append('member_id', fields.memberId);
  form.append('member_since', memberSince);
  form.append('community_name', fields.communityName);
  // Confirmed backend contract: raw PDF Base64, not a URL or data: prefix.
  form.append('member_card_path', pdf.toString('base64'));
  return form;
}

export async function sendVerificationForm(form: FormData) {
  // Use the backend example's Node Axios multipart transport. It supplies
  // Content-Length and the final CRLF required by strict multipart receivers.
  // No automatic retries: a timeout may follow a successfully sent message.
  const response = await axios.post(ENDPOINT, form, {
    adapter: 'http',
    headers: { Accept: '*/*', 'User-Agent': 'Prabasi-Odia/1.0' },
    timeout: 30_000,
    maxRedirects: 0,
    maxBodyLength: Infinity,
    maxContentLength: 1024 * 1024,
    responseType: 'text',
    transformResponse: [(data: string) => data],
    validateStatus: () => true,
  });
  let data: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = JSON.parse(String(response.data).replace(/^\uFEFF/, '').trim());
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as Record<string, unknown>;
  } catch { /* HTML/error responses must not be mistaken for email success. */ }
  const success = response.status >= 200 && response.status < 300 &&
    data?.status !== false && data?.success !== false &&
    (data?.status === true || data?.success === true);
  const errors = Array.isArray(data?.errors) ? data.errors.filter((item) => typeof item === 'string') : [];
  const message = typeof data?.message === 'string' && data.message.trim()
    ? data.message
    : errors.join(' ') || (success ? 'Verification email sent with member card.'
      : response.status === 406
        ? 'The email host rejected the attachment request (HTTP 406). Email delivery could not be confirmed.'
        : `The email provider did not confirm delivery (HTTP ${response.status}).`);
  if (!success) {
    console.error('Verification provider rejected request:', JSON.stringify({
      httpStatus: response.status, contentType: response.headers['content-type'],
      responseIsJson: data !== null, timestamp: new Date().toISOString(),
    }));
  }
  return { success, message, providerStatus: response.status };
}
