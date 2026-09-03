const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

type RequestOptions = RequestInit & { token?: string | null }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message ?? 'Request failed')
  return data as T
}

export type ContactRequestPayload = {
  locale: 'hy' | 'en'
  name: string
  company?: string
  email: string
  phone: string
  message: string
}

export type ContactRequestRecord = ContactRequestPayload & {
  id: number
  status: 'new' | 'in_progress' | 'completed' | 'archived'
  created_at: string
}

export const api = {
  submitContact: (payload: ContactRequestPayload) =>
    request<{ message: string; id: number }>('/contact-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { name: string; email: string } }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getDashboard: (token: string) =>
    request<{
      counts: { new_requests: number; total_requests: number; pages: number; products: number }
      requests: ContactRequestRecord[]
    }>('/admin/dashboard', { token }),
  updateRequestStatus: (token: string, id: number, status: ContactRequestRecord['status']) =>
    request<ContactRequestRecord>(`/admin/contact-requests/${id}`, {
      method: 'PATCH', token, body: JSON.stringify({ status }),
    }),
}
