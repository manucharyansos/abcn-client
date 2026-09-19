import { useEffect, useState } from 'react'
import { api, type AdminPage, type PageLocaleContent } from '../api'
import type { Locale } from '../content'

export function setDocumentMeta(title: string, description: string) {
  document.title = `${title} | ABCN`
  const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (meta) meta.content = description
}

export function useManagedPage(slug: string, locale: Locale, fallbackTitle: string, fallbackDescription: string) {
  const [page, setPage] = useState<AdminPage | null>(null)

  useEffect(() => {
    let active = true
    setDocumentMeta(fallbackTitle, fallbackDescription)
    api.getPublicPage(slug).then((result) => {
      if (!active) return
      setPage(result)
      const meta = result.meta?.[locale]
      setDocumentMeta(meta?.title || fallbackTitle, meta?.description || fallbackDescription)
    }).catch(() => undefined)
    return () => { active = false }
  }, [fallbackDescription, fallbackTitle, locale, slug])

  return (page?.content[locale] ?? {}) as Partial<PageLocaleContent>
}
