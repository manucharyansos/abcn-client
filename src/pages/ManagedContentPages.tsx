import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CalendarDays, FileText, FolderKanban, LoaderCircle, Newspaper, PackageSearch } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api, type EditorialEntry, type Product } from '../api'
import { ClosingCta, Eyebrow, PageHero } from '../components/PublicUi'
import type { Locale, SiteCopy } from '../content'
import { useManagedPage } from '../hooks/useManagedPage'
import { ProductCard } from './PublicPages'

function translationFor(entry: EditorialEntry, locale: Locale) {
  return entry.translations[locale] ?? entry.translations.en
}

function formattedDate(value: string | null | undefined, locale: Locale) {
  if (!value) return ''
  return new Intl.DateTimeFormat(locale === 'hy' ? 'hy-AM' : 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(value))
}

function EntryImage({ entry, locale, icon: Icon }: { entry: EditorialEntry; locale: Locale; icon: typeof FileText }) {
  const image = entry.images?.[0]
  const translation = translationFor(entry, locale)
  return image
    ? <img src={image.url} alt={image.alt?.[locale] || translation.title} />
    : <div className="editorial-image-placeholder"><Icon /></div>
}

function PublicLoading({ locale }: { locale: Locale }) {
  return <div className="catalog-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Բովանդակությունը բեռնվում է…' : 'Loading content…'}</div>
}

export function ServicesPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('services', locale, copy.servicesPage.title, copy.servicesPage.lead)
  const [services, setServices] = useState<EditorialEntry[] | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.getPublicServices(),
      api.getPublicProducts({ locale }),
    ]).then(([serviceResult, productResult]) => {
      if (!active) return
      setServices(serviceResult.status === 'fulfilled' ? serviceResult.value : [])
      setProducts(productResult.status === 'fulfilled' ? productResult.value.data.slice(0, 6) : [])
    })
    return () => { active = false }
  }, [locale])

  return <>
    <PageHero
      eyebrow={managed.eyebrow || copy.servicesPage.eyebrow}
      title={managed.title || copy.servicesPage.title}
      lead={managed.lead || copy.servicesPage.lead}
    />
    <section className="section service-directory-section">
      <div className="container">
        <div className="section-heading"><Eyebrow>{copy.servicesPage.listEyebrow}</Eyebrow><h2>{copy.servicesPage.listTitle}</h2></div>
        {services === null ? <PublicLoading locale={locale} /> : services.length ? <div className="service-directory-grid">
          {services.map((service) => {
            const translation = translationFor(service, locale)
            return <article className="service-directory-card" key={service.id}>
              <BriefcaseBusiness />
              <h2>{translation.title}</h2>
              <p>{translation.summary}</p>
              <Link to={`/services/${service.slug}`} aria-label={translation.title}><ArrowRight /></Link>
            </article>
          })}
        </div> : <div className="public-empty-state"><BriefcaseBusiness /><p>{copy.servicesPage.empty}</p></div>}
      </div>
    </section>
    <section className="section soft-section services-products-section">
      <div className="container">
        <div className="section-heading home-section-heading-row">
          <div><Eyebrow>{copy.servicesPage.productsEyebrow}</Eyebrow><h2>{copy.servicesPage.productsTitle}</h2></div>
          <Link className="text-link" to="/products">{copy.servicesPage.productsAction}<ArrowRight /></Link>
        </div>
        {products.length ? <div className="public-product-grid">{products.map((product) => <ProductCard product={product} locale={locale} key={product.id} />)}</div> : <div className="catalog-teaser-inline"><PackageSearch /><p>{copy.productsPage.status}</p><Link className="button button-outline-blue" to="/products">{copy.servicesPage.productsAction}<ArrowRight /></Link></div>}
      </div>
    </section>
    <ClosingCta copy={copy} />
  </>
}

function EditorialCollectionPage({ kind, copy, locale }: { kind: 'projects' | 'news'; copy: SiteCopy; locale: Locale }) {
  const pageCopy = kind === 'projects' ? copy.projectsPage : copy.newsPage
  const managed = useManagedPage(kind, locale, pageCopy.title, pageCopy.lead)
  const [entries, setEntries] = useState<EditorialEntry[] | null>(null)
  const Icon = kind === 'projects' ? FolderKanban : Newspaper

  useEffect(() => {
    let active = true
    const request = kind === 'projects' ? api.getPublicProjects() : api.getPublicNews()
    request.then((result) => { if (active) setEntries(result) }).catch(() => { if (active) setEntries([]) })
    return () => { active = false }
  }, [kind])

  return <>
    <PageHero eyebrow={managed.eyebrow || pageCopy.eyebrow} title={managed.title || pageCopy.title} lead={managed.lead || pageCopy.lead} />
    <section className={`section editorial-collection-section ${kind}`}>
      <div className="container">
        {entries === null ? <PublicLoading locale={locale} /> : entries.length ? <div className="editorial-card-grid">
          {entries.map((entry) => {
            const translation = translationFor(entry, locale)
            const date = kind === 'projects' ? entry.completed_at : entry.published_at
            return <article className="editorial-card" key={entry.id}>
              <Link className="editorial-card-image" to={`/${kind}/${entry.slug}`}><EntryImage entry={entry} locale={locale} icon={Icon} /></Link>
              <div className="editorial-card-copy">
                {date ? <time dateTime={date}><CalendarDays />{formattedDate(date, locale)}</time> : null}
                <h2><Link to={`/${kind}/${entry.slug}`}>{translation.title}</Link></h2>
                <p>{translation.summary}</p>
                <Link className="text-link" to={`/${kind}/${entry.slug}`}>{pageCopy.view}<ArrowRight /></Link>
              </div>
            </article>
          })}
        </div> : <div className="public-empty-state"><Icon /><p>{pageCopy.empty}</p></div>}
      </div>
    </section>
    <ClosingCta copy={copy} />
  </>
}

export function ProjectsPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  return <EditorialCollectionPage kind="projects" copy={copy} locale={locale} />
}

export function NewsPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  return <EditorialCollectionPage kind="news" copy={copy} locale={locale} />
}

function EditorialDetailPage({ kind, copy, locale }: { kind: 'services' | 'projects' | 'news'; copy: SiteCopy; locale: Locale }) {
  const { slug = '' } = useParams()
  const [entry, setEntry] = useState<EditorialEntry | null>()
  const sectionLabel = kind === 'services' ? copy.nav.services : kind === 'projects' ? copy.nav.projects : copy.nav.news
  const SectionIcon = kind === 'services' ? BriefcaseBusiness : kind === 'projects' ? FolderKanban : Newspaper

  useEffect(() => {
    let active = true
    const request = kind === 'services'
      ? api.getPublicService(slug)
      : kind === 'projects'
        ? api.getPublicProject(slug)
        : api.getPublicNewsArticle(slug)
    request.then((result) => { if (active) setEntry(result) }).catch(() => { if (active) setEntry(null) })
    return () => { active = false }
  }, [kind, slug])

  useEffect(() => {
    if (!entry) return
    const translation = translationFor(entry, locale)
    document.title = `${translation.title} | ABCN`
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta && translation.summary) meta.content = translation.summary
  }, [entry, locale])

  if (entry === undefined) return <section className="section"><div className="container"><PublicLoading locale={locale} /></div></section>
  if (entry === null) return <section className="section"><div className="container public-empty-state"><SectionIcon /><h1>{locale === 'hy' ? 'Նյութը չի գտնվել' : 'Content not found'}</h1><Link className="text-link" to={`/${kind}`}>{locale === 'hy' ? 'Վերադառնալ բաժին' : 'Back to section'}</Link></div></section>

  const translation = translationFor(entry, locale)
  const date = kind === 'projects' ? entry.completed_at : kind === 'news' ? entry.published_at : null
  const image = entry.images?.[0]
  return <>
    <PageHero eyebrow={sectionLabel.toUpperCase()} title={translation.title} lead={translation.summary || ''} />
    <section className="section editorial-detail-section">
      <div className="container editorial-detail-layout">
        <div className="editorial-detail-main">
          {image ? <figure><img src={image.url} alt={image.alt?.[locale] || translation.title} /></figure> : null}
          {date ? <time dateTime={date}><CalendarDays />{formattedDate(date, locale)}</time> : null}
          <div className="editorial-rich-text">{translation.body || translation.summary}</div>
        </div>
        <aside className="editorial-detail-aside">
          <SectionIcon />
          <span>{sectionLabel}</span>
          <h2>{locale === 'hy' ? 'Քննարկենք ձեր պահանջը' : 'Let’s discuss your requirement'}</h2>
          <p>{locale === 'hy' ? 'Կապվեք ABCN-ի թիմի հետ՝ մանրամասները և ճիշտ հաջորդ քայլը հստակեցնելու համար։' : 'Contact the ABCN team to clarify the details and the right next step.'}</p>
          <Link className="button button-primary dark-button" to="/contact">{copy.cta.action}<ArrowRight /></Link>
          {kind === 'services' ? <Link className="text-link" to="/products">{copy.servicesPage.productsAction}<ArrowRight /></Link> : null}
        </aside>
      </div>
    </section>
    <ClosingCta copy={copy} />
  </>
}

export function ServiceDetailPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  return <EditorialDetailPage kind="services" copy={copy} locale={locale} />
}

export function ProjectDetailPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  return <EditorialDetailPage kind="projects" copy={copy} locale={locale} />
}

export function NewsDetailPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  return <EditorialDetailPage kind="news" copy={copy} locale={locale} />
}
