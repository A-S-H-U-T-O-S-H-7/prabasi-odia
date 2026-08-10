export type CCAvenuePaymentData = {
  order_id?: string;
  order_status?: string;
  tracking_id?: string;
  amount?: string;
  currency?: string;
  failure_message?: string;
  status_message?: string;
  bank_ref_no?: string;
  payment_mode?: string;
  billing_name?: string;
  billing_email?: string;
  [key: string]: unknown;
};

export type DonationPaymentStatus = 'completed' | 'failed' | 'cancelled';

const CCAVENUE_RESPONSE_URL = 'https://svsamiti.com/prabasiodia/ccavResponseHandler.php';

export function getRequestBaseUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
}

export async function extractEncResp(request: Request): Promise<string | null> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const value = formData.get('encResp');
    return typeof value === 'string' ? value : null;
  }

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return typeof body?.encResp === 'string' ? body.encResp : null;
  }

  const url = new URL(request.url);
  const queryValue = url.searchParams.get('encResp');
  return queryValue || null;
}

export function normalizePaymentData(raw: unknown): CCAvenuePaymentData | null {
  if (!raw) return null;

  if (typeof raw === 'string') {
    const params = new URLSearchParams(raw);
    const data: CCAvenuePaymentData = {};
    params.forEach((value, key) => {
      data[key] = value;
    });
    return Object.keys(data).length > 0 ? data : null;
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const normalized = normalizePaymentData(item);
      if (normalized?.order_id) return normalized;
    }
    return null;
  }

  if (typeof raw === 'object') {
    return raw as CCAvenuePaymentData;
  }

  return null;
}

export async function decryptCCAvenueResponse(
  encResp: string
): Promise<{ ok: boolean; data?: CCAvenuePaymentData; error?: string }> {
  try {
    const response = await fetch(CCAVENUE_RESPONSE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Prabasi-Odia-Donation/1.0',
      },
      body: new URLSearchParams({ encResp }),
    });

    if (!response.ok) {
      return { ok: false, error: `CCAvenue response handler returned ${response.status}` };
    }

    const text = await response.text();
    const parsed = JSON.parse(text) as {
      status?: boolean;
      data?: unknown;
      message?: string;
    };

    const paymentData = normalizePaymentData(parsed.data);
    if (!paymentData?.order_id) {
      return {
        ok: false,
        error: parsed.message || 'Unable to decrypt payment response',
      };
    }

    return { ok: true, data: paymentData };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Payment decryption failed' };
  }
}

export function mapOrderStatus(orderStatus?: string): DonationPaymentStatus {
  const normalized = String(orderStatus || '').trim().toLowerCase();

  if (normalized === 'success') return 'completed';
  if (normalized === 'aborted') return 'cancelled';
  return 'failed';
}

export function buildSuccessRedirect(baseUrl: string, orderId: string): string {
  const url = new URL('/donation/success', baseUrl);
  url.searchParams.set('order_id', orderId);
  return url.toString();
}

export function buildFailedRedirect(
  baseUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL('/donation/failed', baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

export function amountsMatch(expected: number, received?: string): boolean {
  if (!received) return false;
  const parsed = parseFloat(String(received).replace(/,/g, ''));
  if (Number.isNaN(parsed)) return false;
  return Math.abs(expected - parsed) < 0.01;
}
