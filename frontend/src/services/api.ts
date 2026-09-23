// In production the React app is served by Flask itself, so use a relative
// path — this works regardless of host/port. In Vite dev mode the proxy
// forwards /api/* to Flask on port 5000.
export const API_BASE_URL = '/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',          // send session cookie with every request
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as any).error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
