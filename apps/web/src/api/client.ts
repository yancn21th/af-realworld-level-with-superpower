const BASE = '/api';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    return JSON.parse(stored)?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  // Auth
  register: (username: string, email: string, password: string) =>
    request<any>('POST', '/users', { user: { username, email, password } }),
  login: (email: string, password: string) =>
    request<any>('POST', '/users/login', { user: { email, password } }),
  getUser: () => request<any>('GET', '/user', undefined, true),
  updateUser: (data: any) => request<any>('PUT', '/user', { user: data }, true),

  // Profiles
  getProfile: (username: string) => request<any>('GET', `/profiles/${username}`, undefined, true),
  followUser: (username: string) => request<any>('POST', `/profiles/${username}/follow`, undefined, true),
  unfollowUser: (username: string) => request<any>('DELETE', `/profiles/${username}/follow`, undefined, true),

  // Articles
  getArticles: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>('GET', `/articles${qs}`, undefined, true);
  },
  getFeed: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>('GET', `/articles/feed${qs}`, undefined, true);
  },
  getArticle: (slug: string) => request<any>('GET', `/articles/${slug}`, undefined, true),
  createArticle: (data: any) => request<any>('POST', '/articles', { article: data }, true),
  updateArticle: (slug: string, data: any) => request<any>('PUT', `/articles/${slug}`, { article: data }, true),
  deleteArticle: (slug: string) => request<any>('DELETE', `/articles/${slug}`, undefined, true),
  favoriteArticle: (slug: string) => request<any>('POST', `/articles/${slug}/favorite`, undefined, true),
  unfavoriteArticle: (slug: string) => request<any>('DELETE', `/articles/${slug}/favorite`, undefined, true),

  // Comments
  getComments: (slug: string) => request<any>('GET', `/articles/${slug}/comments`, undefined, true),
  addComment: (slug: string, body: string) => request<any>('POST', `/articles/${slug}/comments`, { comment: { body } }, true),
  deleteComment: (slug: string, id: number) => request<any>('DELETE', `/articles/${slug}/comments/${id}`, undefined, true),

  // Tags
  getTags: () => request<any>('GET', '/tags'),
};
