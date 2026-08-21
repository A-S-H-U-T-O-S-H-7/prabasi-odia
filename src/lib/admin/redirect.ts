export const ADMIN_DEFAULT_PATH = '/admin/dashboard';

export function getSafeAdminRedirect(redirect: string | null | undefined): string {
  if (!redirect) {
    return ADMIN_DEFAULT_PATH;
  }

  let path = redirect;
  try {
    path = decodeURIComponent(redirect);
  } catch {
    return ADMIN_DEFAULT_PATH;
  }

  if (
    !path.startsWith('/admin') ||
    path.startsWith('//') ||
    path.includes('..') ||
    path.includes('\\') ||
    path.includes('://') ||
    path === '/admin/login' ||
    path.startsWith('/admin/login?') ||
    path.startsWith('/admin/login/')
  ) {
    return ADMIN_DEFAULT_PATH;
  }

  return path;
}

export function buildAdminLoginUrl(currentPath: string): string {
  if (!currentPath.startsWith('/admin') || currentPath === '/admin/login') {
    return '/admin/login';
  }

  return `/admin/login?redirect=${encodeURIComponent(currentPath)}`;
}
