/**
 * Fetch helper that automatically includes JWT token in Authorization header.
 * Keeps requests lightweight and avoids sending duplicate auth metadata.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') {
    return new Response(null, { status: 401 });
  }

  const token = window.localStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('X-Requested-With', 'XMLHttpRequest');

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
}
