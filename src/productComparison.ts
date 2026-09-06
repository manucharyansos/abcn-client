import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'abcn-product-comparison'
const CHANGE_EVENT = 'abcn-product-comparison-change'
const MAX_PRODUCTS = 4

function sanitize(slugs: string[]) {
  return [...new Set(slugs.filter(Boolean))].slice(0, MAX_PRODUCTS)
}

function readStoredComparison() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? sanitize(value.filter((item): item is string => typeof item === 'string')) : []
  } catch {
    return []
  }
}

function storeComparison(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {
    // Comparison still works for the current page when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent<string[]>(CHANGE_EVENT, { detail: slugs }))
}

export function useProductComparison() {
  const [slugs, setSlugs] = useState<string[]>(readStoredComparison)

  useEffect(() => {
    const syncFromStorage = () => setSlugs(readStoredComparison())
    const syncWithinPage = (event: Event) => setSlugs(sanitize((event as CustomEvent<string[]>).detail ?? []))
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener(CHANGE_EVENT, syncWithinPage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener(CHANGE_EVENT, syncWithinPage)
    }
  }, [])

  const replace = useCallback((nextSlugs: string[]) => {
    const next = sanitize(nextSlugs)
    setSlugs(next)
    storeComparison(next)
  }, [])

  const toggle = useCallback((slug: string) => {
    if (slugs.includes(slug)) {
      replace(slugs.filter((item) => item !== slug))
      return true
    }
    if (slugs.length >= MAX_PRODUCTS) return false
    replace([...slugs, slug])
    return true
  }, [replace, slugs])

  return {
    slugs,
    limit: MAX_PRODUCTS,
    isSelected: (slug: string) => slugs.includes(slug),
    toggle,
    remove: (slug: string) => replace(slugs.filter((item) => item !== slug)),
    clear: () => replace([]),
    replace,
  }
}
