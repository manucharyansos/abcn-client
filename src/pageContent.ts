import type { AdminPage, PageLocaleContent } from './api'
import { company, content as defaultContent, type Locale, type SiteCopy } from './content'

export type ManagedDirectContact = {
  name: string
  role: string
  phone: string
  email: string
}

export type ManagedCompanyInfo = {
  legalName: string
  email: string
  phone: string
  address: string
  directContacts: ManagedDirectContact[]
}

type JsonObject = Record<string, unknown>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return clone(base)
    const max = Math.max(base.length, override.length)
    return Array.from({ length: max }, (_, index) => {
      if (index >= override.length) return clone(base[index])
      if (index >= base.length) return clone(override[index])
      return deepMerge(base[index], override[index])
    }) as T
  }

  if (isObject(base)) {
    if (!isObject(override)) return clone(base)
    const result: JsonObject = clone(base)
    Object.entries(override).forEach(([key, value]) => {
      result[key] = key in result ? deepMerge(result[key], value) : clone(value)
    })
    return result as T
  }

  return (override === undefined || override === null ? clone(base) : clone(override)) as T
}

export const managedPageNames: Record<string, string> = {
  site: 'Ընդհանուր կարգավորումներ',
  home: 'Գլխավոր էջ',
  about: 'Մեր մասին',
  solutions: 'Լուծումներ',
  services: 'Ծառայություններ',
  projects: 'Նախագծեր',
  products: 'Ապրանքներ',
  news: 'Նորություններ',
  contact: 'Կապ',
}

export function pageContentDefaults(slug: string, locale: Locale): JsonObject {
  const copy = defaultContent[locale]

  switch (slug) {
    case 'site':
      return {
        nav: clone(copy.nav),
        cta: clone(copy.cta),
        footer: clone(copy.footer),
        company: {
          legalName: company.legalName,
          email: company.email,
          phone: company.phone,
          address: locale === 'hy' ? company.addressHy : company.addressEn,
          directContacts: company.team.map((person) => ({
            name: locale === 'hy' ? person.nameHy : person.nameEn,
            role: locale === 'hy' ? person.roleHy : person.roleEn,
            phone: person.phone,
            email: person.email,
          })),
        },
      }
    case 'home':
      return {
        hero: clone(copy.hero),
        intro: clone(copy.intro),
        directions: clone(copy.directions),
        process: clone(copy.process),
        productsTeaser: clone(copy.productsTeaser),
        homeContent: clone(copy.homeContent),
      }
    case 'about':
      return { about: clone(copy.about) }
    case 'solutions':
      return { solutionsPage: clone(copy.solutionsPage) }
    case 'services':
      return { servicesPage: clone(copy.servicesPage) }
    case 'projects':
      return { projectsPage: clone(copy.projectsPage) }
    case 'products':
      return { productsPage: clone(copy.productsPage) }
    case 'news':
      return { newsPage: clone(copy.newsPage) }
    case 'contact':
      return { contact: clone(copy.contact) }
    default:
      return {}
  }
}

function setNested(target: JsonObject, path: string[], value: unknown) {
  if (value === undefined || value === null || value === '') return
  let cursor: JsonObject = target
  path.forEach((part, index) => {
    if (index === path.length - 1) {
      cursor[part] = value
      return
    }
    if (!isObject(cursor[part])) cursor[part] = {}
    cursor = cursor[part] as JsonObject
  })
}

export function normalizeManagedPageContent(slug: string, locale: Locale, current: PageLocaleContent | undefined): JsonObject {
  const source = isObject(current) ? clone(current) : {}
  const legacy = {
    eyebrow: typeof source.eyebrow === 'string' ? source.eyebrow : '',
    title: typeof source.title === 'string' ? source.title : '',
    lead: typeof source.lead === 'string' ? source.lead : '',
    body: typeof source.body === 'string' ? source.body : '',
  }

  delete source.eyebrow
  delete source.title
  delete source.lead
  delete source.body

  const merged = deepMerge(pageContentDefaults(slug, locale), source)

  const sectionBySlug: Record<string, string> = {
    home: 'hero',
    about: 'about',
    solutions: 'solutionsPage',
    services: 'servicesPage',
    projects: 'projectsPage',
    products: 'productsPage',
    news: 'newsPage',
    contact: 'contact',
  }

  const section = sectionBySlug[slug]
  if (section) {
    setNested(merged, [section, 'eyebrow'], legacy.eyebrow)
    setNested(merged, [section, 'title'], legacy.title)
    setNested(merged, [section, 'lead'], legacy.lead)
  }

  if (legacy.body) {
    if (slug === 'home') setNested(merged, ['intro', 'body'], legacy.body)
    if (slug === 'about') setNested(merged, ['about', 'story'], legacy.body)
    if (slug === 'solutions') setNested(merged, ['solutionsPage', 'note'], legacy.body)
  }

  return merged
}

export function applyManagedPages(baseCopy: SiteCopy, pages: AdminPage[], locale: Locale): {
  copy: SiteCopy
  companyInfo: ManagedCompanyInfo
} {
  const next = clone(baseCopy) as unknown as JsonObject
  const bySlug = new Map(pages.map((page) => [page.slug, page]))

  const applySections = (slug: string, sections: string[]) => {
    const page = bySlug.get(slug)
    if (!page) return
    const data = normalizeManagedPageContent(slug, locale, page.content?.[locale])
    sections.forEach((section) => {
      if (data[section] !== undefined && next[section] !== undefined) {
        next[section] = deepMerge(next[section], data[section])
      }
    })
  }

  applySections('site', ['nav', 'cta', 'footer'])
  applySections('home', ['hero', 'intro', 'directions', 'process', 'productsTeaser', 'homeContent'])
  applySections('about', ['about'])
  applySections('solutions', ['solutionsPage'])
  applySections('services', ['servicesPage'])
  applySections('projects', ['projectsPage'])
  applySections('products', ['productsPage'])
  applySections('news', ['newsPage'])
  applySections('contact', ['contact'])

  const site = bySlug.get('site')
  const siteData = site
    ? normalizeManagedPageContent('site', locale, site.content?.[locale])
    : pageContentDefaults('site', locale)

  const defaultCompany = pageContentDefaults('site', locale).company as ManagedCompanyInfo
  const companyInfo = deepMerge(defaultCompany, siteData.company) as ManagedCompanyInfo

  return { copy: next as unknown as SiteCopy, companyInfo }
}
