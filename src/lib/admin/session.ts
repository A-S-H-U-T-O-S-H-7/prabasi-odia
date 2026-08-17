export const ADMIN_SESSION_COOKIE = 'admin-session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export type AdminSessionPayload = {
  uid: string;
  email: string;
  role: string;
  exp: number;
};

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return secret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-admin-session-secret';
  }

  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((value.length % 4) || 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAdminSession(
  payload: Omit<AdminSessionPayload, 'exp'>
): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }

  const body: AdminSessionPayload = {
    ...payload,
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(body)));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded));
  return `${encoded}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token) {
    return null;
  }

  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature) as BufferSource,
      new TextEncoder().encode(encoded)
    );
    if (!valid) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded))
    ) as AdminSessionPayload;

    if (!payload.uid || !payload.email || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}
