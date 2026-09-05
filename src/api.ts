const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

type RequestOptions = RequestInit & { token?: string | null }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const validation = data.errors ? Object.values(data.errors).flat().join(' ') : ''
    throw new Error(validation || data.message || 'Request failed')
  }
  return data as T
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export type Status = 'draft' | 'published' | 'archived'
export type PageLocaleContent = { eyebrow: string; title: string; lead: string; body: string }
export type PageMeta = { title: string; description: string }

export type AdminPage = {
  id: number
  slug: string
  status: Status
  content: { hy: Partial<PageLocaleContent>; en: Partial<PageLocaleContent> }
  meta: { hy?: Partial<PageMeta>; en?: Partial<PageMeta> } | null
  updated_at: string
}

export type ProductCategory = {
  id: number
  parent_id: number | null
  slug: string
  status: Status
  sort_order: number
  translations: { hy: { name: string }; en: { name: string } }
  parent?: { id: number; slug: string } | null
}

export type ProductTranslation = { name: string; description?: string }
export type ProductAsset = { url: string; name?: string; alt?: { hy?: string; en?: string } }
export type Product = {
  id: number
  product_category_id: number | null
  slug: string
  sku: string | null
  status: Status
  featured: boolean
  sort_order: number
  translations: { hy: ProductTranslation; en: ProductTranslation }
  specifications: { hy?: Record<string, string>; en?: Record<string, string> } | null
  images: ProductAsset[] | null
  documents: ProductAsset[] | null
  category?: ProductCategory | null
  updated_at: string
}

export type MediaAsset = {
  id: number
  original_name: string
  mime_type: string
  kind: 'image' | 'document'
  size: number
  url: string
  alt: { hy?: string; en?: string } | null
  created_at: string
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
  per_page: number
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
      method: 'POST', body: JSON.stringify(payload),
    }),

  getPublicPage: (slug: string) => request<AdminPage>(`/pages/${slug}`),
  getPublicCategories: () => request<ProductCategory[]>('/product-categories'),
  getPublicProducts: (page = 1) => request<Paginated<Product>>(`/products?page=${page}`),
  getPublicProduct: (slug: string) => request<Product>(`/products/${slug}`),

  login: (email: string, password: string) =>
    request<{ token: string; user: { name: string; email: string } }>('/admin/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  logout: (token: string) => request<{ message: string }>('/admin/logout', { method: 'POST', token }),
  getDashboard: (token: string) =>
    request<{
      counts: { new_requests: number; total_requests: number; pages: number; products: number; media: number }
      requests: ContactRequestRecord[]
    }>('/admin/dashboard', { token }),

  getContactRequests: (token: string, params: { page?: number; status?: string; search?: string } = {}) =>
    request<Paginated<ContactRequestRecord>>(withQuery('/admin/contact-requests', params), { token }),
  updateRequestStatus: (token: string, id: number, status: ContactRequestRecord['status']) =>
    request<ContactRequestRecord>(`/admin/contact-requests/${id}`, {
      method: 'PATCH', token, body: JSON.stringify({ status }),
    }),

  getPages: (token: string) => request<AdminPage[]>('/admin/pages', { token }),
  updatePage: (token: string, page: AdminPage) => request<AdminPage>(`/admin/pages/${page.id}`, {
    method: 'PUT', token, body: JSON.stringify({
      slug: page.slug, status: page.status, content: page.content, meta: page.meta,
    }),
  }),

  getCategories: (token: string) => request<ProductCategory[]>('/admin/product-categories', { token }),
  saveCategory: (token: string, category: Omit<ProductCategory, 'id'> & { id?: number }) =>
    request<ProductCategory>(category.id ? `/admin/product-categories/${category.id}` : '/admin/product-categories', {
      method: category.id ? 'PUT' : 'POST', token, body: JSON.stringify(category),
    }),
  deleteCategory: (token: string, id: number) => request<void>(`/admin/product-categories/${id}`, { method: 'DELETE', token }),

  getProducts: (token: string, params: { page?: number; status?: string; category?: number; search?: string } = {}) =>
    request<Paginated<Product>>(withQuery('/admin/products', params), { token }),
  saveProduct: (token: string, product: Omit<Product, 'id' | 'updated_at' | 'category'> & { id?: number }) =>
    request<Product>(product.id ? `/admin/products/${product.id}` : '/admin/products', {
      method: product.id ? 'PUT' : 'POST', token, body: JSON.stringify(product),
    }),
  deleteProduct: (token: string, id: number) => request<void>(`/admin/products/${id}`, { method: 'DELETE', token }),

  getMedia: (token: string, page = 1) => request<Paginated<MediaAsset>>(`/admin/media?page=${page}`, { token }),
  uploadMedia: (token: string, file: File, alt: { hy: string; en: string }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('alt[hy]', alt.hy)
    form.append('alt[en]', alt.en)
    return request<MediaAsset>('/admin/media', { method: 'POST', token, body: form })
  },
  deleteMedia: (token: string, id: number) => request<void>(`/admin/media/${id}`, { method: 'DELETE', token }),
}
