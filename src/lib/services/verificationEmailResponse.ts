// Browser-safe response validation; never treat HTML or HTTP errors as success.
export function parseVerificationEmailResponse(status: number, body: unknown) {
  let data: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = typeof body === 'string'
      ? JSON.parse(body.replace(/^\uFEFF/, '').trim()) : body;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as Record<string, unknown>;
  } catch { /* The provider can return a non-JSON rejection page. */ }
  const success = status >= 200 && status < 300 &&
    data?.status !== false && data?.success !== false &&
    (data?.status === true || data?.success === true);
  const errors = Array.isArray(data?.errors) ? data.errors.filter((item) => typeof item === 'string') : [];
  const message = typeof data?.message === 'string' && data.message.trim()
    ? data.message
    : errors.join(' ') || (success ? 'Verification email request accepted.'
      : `The email provider did not confirm delivery (HTTP ${status}).`);
  return { success, message, providerStatus: status };
}
