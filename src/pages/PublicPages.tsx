import { type FormEvent, type MouseEvent as ReactMouseEvent, useEffect, useState } from 'react'
import {
  ArrowRight, Cable, Check, ChevronRight, CircleGauge, FileText,
  Layers3, LoaderCircle, Mail, MapPin, Network, PackageSearch, Phone, RotateCw, Scale, ScanSearch, Search, Send, SlidersHorizontal, X,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, type AdminPage, type CatalogFacet, type PageLocaleContent, type Product, type ProductCategory } from '../api'
import { company, type Locale, type SiteCopy } from '../content'
import { useProductComparison } from '../productComparison'

const directionIcons = [Cable, SlidersHorizontal, CircleGauge, Network]

function setDocumentMeta(title: string, description: string) {
  document.title = `${title} | ABCN`
  const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (meta) meta.content = description
}

function useManagedPage(slug: string, locale: Locale, fallbackTitle: string, fallbackDescription: string) {
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

function flattenCategories(categories: ProductCategory[]): ProductCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])])
}

function productAssetUrl(product: Product) {
  return product.images?.[0]?.url ?? ''
}

function ProductGallery({ product, locale, productName }: { product: Product; locale: Locale; productName: string }) {
  const images = product.images ?? []
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zooming, setZooming] = useState(false)
  const activeIndex = images[selectedIndex] ? selectedIndex : 0
  const activeImage = images[activeIndex]

  function updateZoom(event: ReactMouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
    event.currentTarget.parentElement?.style.setProperty('--zoom-x', `${x}%`)
    event.currentTarget.parentElement?.style.setProperty('--zoom-y', `${y}%`)
  }

  function selectImage(index: number) {
    setSelectedIndex(index)
    setZooming(false)
  }

  return <div className="product-gallery">
    <div className="product-gallery-stage">
      <div className="product-detail-image" onMouseEnter={() => setZooming(Boolean(activeImage))} onMouseMove={activeImage ? updateZoom : undefined} onMouseLeave={() => setZooming(false)}>
        {activeImage ? <img src={activeImage.url} alt={activeImage.alt?.[locale] || productName} /> : <PackageSearch />}
        {zooming ? <span className="product-zoom-lens" aria-hidden="true" /> : null}
      </div>
      {activeImage && zooming ? <div
        className="product-zoom-preview"
        style={{ backgroundImage: `url(${activeImage.url})` }}
        aria-hidden="true"
      /> : null}
    </div>
    {images.length > 1 ? <div className="product-thumbnails" aria-label={locale === 'hy' ? 'Ապրանքի նկարներ' : 'Product images'}>
      {images.slice(0, 4).map((image, index) => <button
        type="button"
        className={activeIndex === index ? 'active' : ''}
        aria-pressed={activeIndex === index}
        aria-label={locale === 'hy' ? `Ցույց տալ նկար ${index + 1}` : `Show image ${index + 1}`}
        onClick={() => selectImage(index)}
        key={`${image.url}-${index}`}
      ><img src={image.url} alt="" loading="lazy" /></button>)}
    </div> : null}
    {activeImage ? <p className="product-zoom-hint"><ScanSearch />{locale === 'hy' ? 'Պահեք մկնիկը նկարի վրա՝ մեծացնելու համար' : 'Hover over the image to magnify'}</p> : null}
  </div>
}

function ProductCard({
  product,
  locale,
  comparisonSelected = false,
  comparisonDisabled = false,
  onCompare,
}: {
  product: Product
  locale: Locale
  comparisonSelected?: boolean
  comparisonDisabled?: boolean
  onCompare?: (product: Product) => void
}) {
  const translation = product.translations[locale] ?? product.translations.en
  const image = productAssetUrl(product)

  return <article className={`public-product-card${comparisonSelected ? ' is-compared' : ''}`}>
    <Link className="public-product-card-link" to={`/products/${product.slug}`}>
      <div className="public-product-image">
        {image ? <img src={image} alt={product.images?.[0]?.alt?.[locale] || translation.name} /> : <PackageSearch />}
        {product.featured ? <span>{locale === 'hy' ? 'Ընտրված' : 'Featured'}</span> : null}
      </div>
      <div className="public-product-copy">
        <small>{product.category?.translations?.[locale]?.name || product.sku}</small>
        <h2>{translation.name}</h2>
        <p>{translation.description}</p>
        <strong>{locale === 'hy' ? 'Տեսնել մանրամասները' : 'View details'}<ArrowRight /></strong>
      </div>
    </Link>
    {onCompare ? <button
      type="button"
      className="product-compare-toggle"
      aria-pressed={comparisonSelected}
      disabled={comparisonDisabled}
      onClick={() => onCompare(product)}
    >{comparisonSelected ? <Check /> : <Scale />}{comparisonSelected ? (locale === 'hy' ? 'Ընտրված է' : 'Selected') : (locale === 'hy' ? 'Համեմատել' : 'Compare')}</button> : null}
  </article>
}

type ProductInfoTab = 'overview' | 'specifications' | 'documents'

function ProductInformation({ product, locale, description }: { product: Product; locale: Locale; description: string }) {
  const [activeTab, setActiveTab] = useState<ProductInfoTab>('overview')
  const specs = product.specifications?.[locale] ?? product.specifications?.en ?? {}
  const documents = product.documents ?? []
  const categoryName = product.category?.translations?.[locale]?.name || product.category?.translations?.en.name || '—'
  const tabs: { id: ProductInfoTab; label: string }[] = [
    { id: 'overview', label: locale === 'hy' ? 'Նկարագրություն' : 'Overview' },
    { id: 'specifications', label: locale === 'hy' ? 'Տեխնիկական տվյալներ' : 'Specifications' },
    { id: 'documents', label: `${locale === 'hy' ? 'Փաստաթղթեր' : 'Documents'}${documents.length ? ` (${documents.length})` : ''}` },
  ]

  return <div className="product-detail-info">
    {product.sku ? <p className="product-sku">SKU · {product.sku}</p> : null}
    <div className="product-info-tabs" role="tablist" aria-label={locale === 'hy' ? 'Ապրանքի տեղեկություն' : 'Product information'}>
      {tabs.map((tab) => <button
        type="button"
        role="tab"
        id={`product-tab-${tab.id}`}
        aria-selected={activeTab === tab.id}
        aria-controls={`product-panel-${tab.id}`}
        className={activeTab === tab.id ? 'active' : ''}
        onClick={() => setActiveTab(tab.id)}
        key={tab.id}
      >{tab.label}</button>)}
    </div>
    <div className="product-info-panel" role="tabpanel" id="product-panel-overview" aria-labelledby="product-tab-overview" hidden={activeTab !== 'overview'}>
      <div className="product-overview">
        <p>{description}</p>
        <div className="product-overview-meta">
          <div><span>{locale === 'hy' ? 'Կատեգորիա' : 'Category'}</span><strong>{categoryName}</strong></div>
          <div><span>SKU</span><strong>{product.sku || '—'}</strong></div>
        </div>
      </div>
    </div>
    <div className="product-info-panel" role="tabpanel" id="product-panel-specifications" aria-labelledby="product-tab-specifications" hidden={activeTab !== 'specifications'}>
      {Object.keys(specs).length
        ? <dl>{Object.entries(specs).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
        : <p className="product-info-empty">{locale === 'hy' ? 'Տեխնիկական տվյալները ճշտվում են։' : 'Technical data is being prepared.'}</p>}
    </div>
    <div className="product-info-panel" role="tabpanel" id="product-panel-documents" aria-labelledby="product-tab-documents" hidden={activeTab !== 'documents'}>
      <div className="product-documents">
        {documents.length ? documents.map((document, index) => <a key={`${document.url}-${index}`} href={document.url} target="_blank" rel="noreferrer"><FileText />{document.name || 'PDF'}</a>) : <p className="product-info-empty">{locale === 'hy' ? 'Փաստաթղթերը շուտով կավելացվեն։' : 'Documents will be added soon.'}</p>}
      </div>
    </div>
    <div className="product-quote-box">
      <p>{locale === 'hy' ? 'Պե՞տք է ընտրության աջակցություն կամ գնային առաջարկ։' : 'Need selection support or a commercial quote?'}</p>
      <Link className="button button-primary dark-button" to={`/contact?product=${encodeURIComponent(product.slug)}`}>{locale === 'hy' ? 'Ստանալ առաջարկ' : 'Request a quote'}<ArrowRight /></Link>
    </div>
  </div>
}

function Eyebrow({ children }: { children: string }) {
  return <p className="eyebrow"><span />{children}</p>
}

function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero-grid" aria-hidden="true" />
      <div className="container page-hero-inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
    </section>
  )
}

function ClosingCta({ copy }: { copy: SiteCopy }) {
  return (
    <section className="closing-cta">
      <div className="container closing-cta-inner">
        <div>
          <Eyebrow>{copy.cta.eyebrow}</Eyebrow>
          <h2>{copy.cta.title}</h2>
          <p>{copy.cta.body}</p>
        </div>
        <Link className="button button-light" to="/contact">
          {copy.cta.action}<ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

export function HomePage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('home', locale, copy.hero.title, copy.hero.body)
  return (
    <>
      <section className="home-hero">
        <img className="home-hero-image" src="/images/abcn-hero.webp" alt="" />
        <div className="home-hero-shade" />
        <div className="container home-hero-content">
          <Eyebrow>{managed.eyebrow || copy.hero.eyebrow}</Eyebrow>
          <h1>{managed.title || copy.hero.title}</h1>
          <p className="hero-lead">{managed.lead || copy.hero.body}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/contact">
              {copy.hero.primary}<ArrowRight size={18} />
            </Link>
            <a className="text-link text-link-light" href="#approach">
              {copy.hero.secondary}<ChevronRight size={17} />
            </a>
          </div>
          <p className="hero-note">{copy.hero.note}</p>
        </div>
        <div className="hero-rail" aria-hidden="true"><span>ABCN</span><i /></div>
      </section>

      <section className="section intro-section" id="approach">
        <div className="container split-intro">
          <Eyebrow>{copy.intro.eyebrow}</Eyebrow>
          <div>
            <h2>{copy.intro.title}</h2>
            <p>{managed.body || copy.intro.body}</p>
            <Link className="text-link" to="/about">{copy.intro.link}<ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="section directions-section">
        <div className="container">
          <div className="section-heading">
            <Eyebrow>{copy.directions.eyebrow}</Eyebrow>
            <h2>{copy.directions.title}</h2>
          </div>
          <div className="direction-grid">
            {copy.directions.items.map((item, index) => {
              const Icon = directionIcons[index]
              return (
                <article className="direction-card" key={item.index}>
                  <div className="direction-card-top"><span>{item.index}</span><Icon size={26} strokeWidth={1.6} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <Link to="/solutions" aria-label={item.title}><ArrowRight size={19} /></Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section process-section">
        <div className="container process-layout">
          <div className="process-heading">
            <Eyebrow>{copy.process.eyebrow}</Eyebrow>
            <h2>{copy.process.title}</h2>
          </div>
          <div className="process-list">
            {copy.process.items.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span><div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section catalog-teaser">
        <div className="container catalog-teaser-inner">
          <div className="catalog-mark" aria-hidden="true"><Layers3 /><span>ABCN / CATALOG</span></div>
          <div>
            <Eyebrow>{copy.productsTeaser.eyebrow}</Eyebrow>
            <h2>{copy.productsTeaser.title}</h2>
            <p>{copy.productsTeaser.body}</p>
            <Link className="button button-outline" to="/products">{copy.productsTeaser.action}<ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <ClosingCta copy={copy} />
    </>
  )
}

export function AboutPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('about', locale, copy.about.title, copy.about.lead)
  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.about.eyebrow} title={managed.title || copy.about.title} lead={managed.lead || copy.about.lead} />
      <section className="section">
        <div className="container editorial-grid">
          <div className="editorial-index">01</div>
          <div><h2>{copy.about.storyTitle}</h2><p className="large-copy">{managed.body || copy.about.story}</p></div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <div className="section-heading"><Eyebrow>{copy.about.principlesTitle}</Eyebrow></div>
          <div className="principle-grid">
            {copy.about.principles.map(([title, text], index) => (
              <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading"><Eyebrow>{copy.about.teamTitle}</Eyebrow></div>
          <div className="team-grid">
            {company.team.map((person) => {
              const armenian = copy.nav.home === 'Գլխավոր'
              return (
                <article className="team-card" key={person.email}>
                  <div className="team-monogram">{person.nameEn.split(' ').map((word) => word[0]).join('')}</div>
                  <div><h3>{armenian ? person.nameHy : person.nameEn}</h3><p>{armenian ? person.roleHy : person.roleEn}</p></div>
                  <a href={`mailto:${person.email}`}>{person.email}</a>
                  <a href={`tel:${person.phone.replace(/\s/g, '')}`}>{person.phone}</a>
                </article>
              )
            })}
          </div>
        </div>
      </section>
      <ClosingCta copy={copy} />
    </>
  )
}

export function SolutionsPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('solutions', locale, copy.solutionsPage.title, copy.solutionsPage.lead)
  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.solutionsPage.eyebrow} title={managed.title || copy.solutionsPage.title} lead={managed.lead || copy.solutionsPage.lead} />
      <section className="section">
        <div className="container solution-list">
          {copy.directions.items.map((item, index) => {
            const Icon = directionIcons[index]
            return (
              <article key={item.index}>
                <div className="solution-icon"><Icon /></div>
                <span>{item.index}</span><h2>{item.title}</h2><p>{item.text}</p>
                <Link to="/contact"><ArrowRight /></Link>
              </article>
            )
          })}
        </div>
      </section>
      <section className="section soft-section">
        <div className="container expansion-note">
          <div className="expansion-icon"><Network /></div>
          <div><h2>{copy.solutionsPage.noteTitle}</h2><p>{managed.body || copy.solutionsPage.note}</p></div>
        </div>
      </section>
      <ClosingCta copy={copy} />
    </>
  )
}

export function ProductsPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('products', locale, copy.productsPage.title, copy.productsPage.lead)
  const icons = [Layers3, SlidersHorizontal, FileText, Send]
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [facets, setFacets] = useState<CatalogFacet[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [catalogError, setCatalogError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const comparison = useProductComparison()
  const [comparisonLimitReached, setComparisonLimitReached] = useState(false)

  useEffect(() => {
    let active = true
    api.getPublicCategories().then((categoryData) => { if (active) setCategories(categoryData) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    setCatalogError(false)
    api.getPublicProducts({
      category: selectedCategory ?? undefined,
      search: query || undefined,
      locale,
      filters: activeFilters,
    }).then((productData) => {
      if (!active) return
      setProducts(productData.data)
      setFacets(productData.facets)
      setCurrentPage(productData.current_page)
      setLastPage(productData.last_page)
      setTotal(productData.total)
    }).catch(() => {
      if (!active) return
      setProducts([])
      setFacets([])
      setTotal(0)
      setCatalogError(true)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [activeFilters, locale, query, reloadKey, selectedCategory])

  function retryCatalog() {
    setLoading(true)
    setCatalogError(false)
    setReloadKey((value) => value + 1)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActiveFilters({})
    setQuery(search.trim())
  }

  function selectCategory(categoryId: number | null) {
    setSelectedCategory(categoryId)
    setActiveFilters({})
  }

  function clearCatalogFilters() {
    setSearch('')
    setQuery('')
    setSelectedCategory(null)
    setActiveFilters({})
  }

  async function loadMore() {
    if (loadingMore || currentPage >= lastPage) return
    setLoadingMore(true)
    setCatalogError(false)
    try {
      const result = await api.getPublicProducts({
        page: currentPage + 1,
        category: selectedCategory ?? undefined,
        search: query || undefined,
        locale,
        filters: activeFilters,
      })
      setProducts((current) => [...current, ...result.data])
      setFacets(result.facets)
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
      setTotal(result.total)
    } catch {
      setCatalogError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  function toggleComparison(product: Product) {
    const changed = comparison.toggle(product.slug)
    setComparisonLimitReached(!changed)
  }

  const flatCategories = flattenCategories(categories)
  const selectedCategoryRecord = flatCategories.find((category) => category.id === selectedCategory)
  const activeRootId = selectedCategoryRecord?.parent_id ?? selectedCategoryRecord?.id ?? null
  const activeRoot = categories.find((category) => category.id === activeRootId)
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length
  const hasCatalogCriteria = Boolean(query || selectedCategory !== null || activeFilterCount)
  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.productsPage.eyebrow} title={managed.title || copy.productsPage.title} lead={managed.lead || copy.productsPage.lead} />
      <section className="section products-preview">
        <div className="container">
          <div className="catalog-tools">
            <form className="catalog-search" onSubmit={submitSearch} role="search">
              <Search aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={locale === 'hy' ? 'Որոնել անվանումով, մոդելով կամ SKU-ով' : 'Search by name, model or SKU'} aria-label={locale === 'hy' ? 'Որոնել կատալոգում' : 'Search catalog'} />
              {search ? <button type="button" className="catalog-search-clear" aria-label={locale === 'hy' ? 'Մաքրել որոնումը' : 'Clear search'} onClick={() => { setSearch(''); setQuery('') }}><X /></button> : null}
              <button type="submit" className="button button-primary dark-button">{locale === 'hy' ? 'Որոնել' : 'Search'}</button>
            </form>
            {categories.length ? <div className="catalog-filter-groups">
              <div className="catalog-filters" aria-label={locale === 'hy' ? 'Ապրանքների կատեգորիաներ' : 'Product categories'}>
                <button className={selectedCategory === null ? 'active' : ''} onClick={() => selectCategory(null)}>{locale === 'hy' ? 'Բոլորը' : 'All products'}</button>
                {categories.map((category) => <button key={category.id} className={activeRoot?.id === category.id ? 'active' : ''} onClick={() => selectCategory(category.id)}>{category.translations[locale]?.name || category.translations.en.name}</button>)}
              </div>
              {activeRoot?.children?.length ? <div className="catalog-subfilters" aria-label={locale === 'hy' ? 'Ապրանքների ենթակատեգորիաներ' : 'Product subcategories'}>
                <span>{locale === 'hy' ? 'Ենթակատեգորիաներ' : 'Subcategories'}</span>
                <button className={selectedCategory === activeRoot.id ? 'active' : ''} onClick={() => selectCategory(activeRoot.id)}>{locale === 'hy' ? 'Բոլորը բաժնում' : 'All in category'}</button>
                {activeRoot.children.map((category) => <button key={category.id} className={selectedCategory === category.id ? 'active' : ''} onClick={() => selectCategory(category.id)}>{category.translations[locale]?.name || category.translations.en.name}</button>)}
              </div> : null}
            </div> : null}
          </div>
          {loading && <div className="catalog-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Կատալոգը բեռնվում է…' : 'Loading catalog…'}</div>}
          {!loading && catalogError && products.length === 0 ? <div className="catalog-message" role="alert">
            <PackageSearch />
            <h2>{locale === 'hy' ? 'Կատալոգը ժամանակավորապես հասանելի չէ' : 'The catalog is temporarily unavailable'}</h2>
            <p>{locale === 'hy' ? 'Փորձեք կրկին կամ կապվեք մեզ հետ՝ ապրանքի մասին տեղեկություն ստանալու համար։' : 'Try again or contact us for product information.'}</p>
            <button className="button button-outline-blue" type="button" onClick={retryCatalog}><RotateCw />{locale === 'hy' ? 'Փորձել կրկին' : 'Try again'}</button>
          </div> : null}
          {!loading && products.length > 0 ? <>
            <div className="catalog-result-bar"><strong>{locale === 'hy' ? `${total} ապրանք` : `${total} products`}</strong>{hasCatalogCriteria ? <button type="button" onClick={clearCatalogFilters}><X />{locale === 'hy' ? 'Մաքրել բոլորը' : 'Clear all'}</button> : null}</div>
            <div className={`catalog-results-layout ${facets.length ? '' : 'without-facets'}`}>
              {facets.length ? <aside className="technical-filter-panel">
                <div className="technical-filter-title"><SlidersHorizontal /><div><strong>{locale === 'hy' ? 'Տեխնիկական ֆիլտրեր' : 'Technical filters'}</strong><span>{activeFilterCount ? (locale === 'hy' ? `${activeFilterCount} ընտրված` : `${activeFilterCount} selected`) : (locale === 'hy' ? 'Ընտրեք անհրաժեշտ արժեքները' : 'Choose required values')}</span></div></div>
                {facets.map((facet) => <label className="technical-filter-field" key={facet.key}><span>{facet.label[locale] || facet.label.en}</span><select value={activeFilters[facet.key] ?? ''} onChange={(event) => setActiveFilters((current) => ({ ...current, [facet.key]: event.target.value }))}>
                  <option value="">{locale === 'hy' ? 'Բոլոր տարբերակները' : 'All options'}</option>
                  {facet.options.map((option) => <option value={option.value} key={option.value}>{option.label[locale] || option.label.en} ({option.count})</option>)}
                </select></label>)}
                {activeFilterCount ? <button type="button" className="technical-filter-reset" onClick={() => setActiveFilters({})}><RotateCw />{locale === 'hy' ? 'Մաքրել տեխնիկական ֆիլտրերը' : 'Reset technical filters'}</button> : null}
              </aside> : null}
              <div className="catalog-results-main">
                <div className="public-product-grid">{products.map((product) => {
                  const selected = comparison.isSelected(product.slug)
                  return <ProductCard
                    product={product}
                    locale={locale}
                    comparisonSelected={selected}
                    comparisonDisabled={!selected && comparison.slugs.length >= comparison.limit}
                    onCompare={toggleComparison}
                    key={product.id}
                  />
                })}</div>
                {currentPage < lastPage ? <button className="button catalog-more" type="button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? <LoaderCircle className="spin" /> : null}{loadingMore ? (locale === 'hy' ? 'Բեռնվում է…' : 'Loading…') : (locale === 'hy' ? 'Ցույց տալ ավելին' : 'Show more')}</button> : null}
                {catalogError ? <p className="catalog-inline-error" role="alert">{locale === 'hy' ? 'Հաջորդ ապրանքները չբեռնվեցին։ Փորձեք կրկին։' : 'More products could not be loaded. Please try again.'}</p> : null}
              </div>
            </div>
          </> : !loading && !catalogError && hasCatalogCriteria ? <div className="catalog-message catalog-no-results"><PackageSearch /><h2>{locale === 'hy' ? 'Համապատասխան ապրանք չի գտնվել' : 'No matching products found'}</h2><p>{locale === 'hy' ? 'Փոխեք որոնման բառը, կատեգորիան կամ տեխնիկական ֆիլտրերը։' : 'Change the search term, category, or technical filters.'}</p><button className="button button-outline-blue" type="button" onClick={clearCatalogFilters}>{locale === 'hy' ? 'Մաքրել ֆիլտրերը' : 'Clear filters'}</button></div> : !loading && !catalogError && <>
            <div className="catalog-status"><span className="status-dot" />{copy.productsPage.status}</div>
            <div className="product-feature-grid">
            {copy.productsPage.features.map(([title, text], index) => {
              const Icon = icons[index]
              return <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>
            })}
            </div>
            <Link className="button button-primary dark-button" to="/contact">{copy.productsPage.action}<ArrowRight size={18} /></Link>
          </>}
        </div>
      </section>
      <ClosingCta copy={copy} />
      {comparison.slugs.length ? <aside className="comparison-bar" aria-label={locale === 'hy' ? 'Ապրանքների համեմատում' : 'Product comparison'}>
        <div className="comparison-bar-inner">
          <div className="comparison-bar-count"><Scale /><div><strong>{locale === 'hy' ? 'Ապրանքների համեմատում' : 'Product comparison'}</strong><span>{comparisonLimitReached
            ? (locale === 'hy' ? 'Կարելի է ընտրել առավելագույնը 4 ապրանք' : 'You can select up to 4 products')
            : (locale === 'hy' ? `${comparison.slugs.length} / ${comparison.limit} ընտրված` : `${comparison.slugs.length} / ${comparison.limit} selected`)}</span></div></div>
          <div className="comparison-bar-actions">
            <button type="button" className="comparison-clear" onClick={() => { comparison.clear(); setComparisonLimitReached(false) }}>{locale === 'hy' ? 'Մաքրել' : 'Clear'}</button>
            {comparison.slugs.length >= 2
              ? <Link className="button button-primary" to={`/compare?products=${encodeURIComponent(comparison.slugs.join(','))}`}>{locale === 'hy' ? 'Համեմատել' : 'Compare'}<ArrowRight /></Link>
              : <span className="comparison-more-hint">{locale === 'hy' ? 'Ընտրեք ևս մեկ ապրանք' : 'Select one more product'}</span>}
          </div>
        </div>
      </aside> : null}
    </>
  )
}

export function ProductDetailPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    api.getPublicProduct(slug).then((result) => { if (active) setProduct(result) }).catch(() => { if (active) setProduct(null) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (!product) {
      setDocumentMeta(copy.productsPage.title, copy.productsPage.lead)
      return
    }
    const translation = product.translations[locale] ?? product.translations.en
    setDocumentMeta(translation.name, translation.description || copy.productsPage.lead)
  }, [copy.productsPage.lead, copy.productsPage.title, locale, product])

  if (loading) return <section className="section"><div className="container catalog-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Ապրանքը բեռնվում է…' : 'Loading product…'}</div></section>
  if (!product) return <section className="section"><div className="container catalog-empty"><h1>{locale === 'hy' ? 'Ապրանքը չի գտնվել' : 'Product not found'}</h1><Link className="text-link" to="/products">{locale === 'hy' ? 'Վերադառնալ կատալոգ' : 'Back to catalog'}</Link></div></section>

  const translation = product.translations[locale] ?? product.translations.en
  const categoryName = product.category?.translations?.[locale]?.name || product.category?.translations?.en.name
  const relatedProducts = product.related_products ?? []
  return <>
    <PageHero eyebrow={product.category?.translations?.[locale]?.name || copy.productsPage.eyebrow} title={translation.name} lead={translation.description || copy.productsPage.lead} />
    <section className="section product-detail-section"><div className="container">
      <nav className="product-breadcrumb" aria-label={locale === 'hy' ? 'Նավիգացիոն ուղի' : 'Breadcrumb'}>
        <Link to="/">{locale === 'hy' ? 'Գլխավոր' : 'Home'}</Link><ChevronRight />
        <Link to="/products">{locale === 'hy' ? 'Ապրանքներ' : 'Products'}</Link><ChevronRight />
        {categoryName ? <><span>{categoryName}</span><ChevronRight /></> : null}
        <strong>{translation.name}</strong>
      </nav>
      <div className="product-detail-grid">
        <ProductGallery product={product} locale={locale} productName={translation.name} key={product.id} />
        <ProductInformation product={product} locale={locale} description={translation.description || copy.productsPage.lead} key={product.id} />
      </div>
    </div></section>
    {relatedProducts.length ? <section className="section soft-section related-products-section"><div className="container">
      <div className="section-heading related-products-heading"><Eyebrow>{locale === 'hy' ? 'ՆՈՒՅՆ ԿԱՏԵԳՈՐԻԱՅԻՑ' : 'FROM THE SAME CATEGORY'}</Eyebrow><h2>{locale === 'hy' ? 'Հարակից ապրանքներ' : 'Related products'}</h2></div>
      <div className="public-product-grid">{relatedProducts.map((relatedProduct) => <ProductCard product={relatedProduct} locale={locale} key={relatedProduct.id} />)}</div>
    </div></section> : null}
  </>
}

export function ContactPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
  const managed = useManagedPage('contact', locale, copy.contact.title, copy.contact.lead)
  const [searchParams] = useSearchParams()
  const productSlug = searchParams.get('product')?.trim() ?? ''
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productState, setProductState] = useState<'idle' | 'loading' | 'ready' | 'error'>(productSlug ? 'loading' : 'idle')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setSelectedProduct(null)
    setProductState(productSlug ? 'loading' : 'idle')
    if (!productSlug) return () => { active = false }

    api.getPublicProduct(productSlug).then((product) => {
      if (!active) return
      setSelectedProduct(product)
      setProductState('ready')
    }).catch(() => {
      if (!active) return
      setProductState('error')
    })

    return () => { active = false }
  }, [productSlug])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    try {
      await api.submitContact({
        locale,
        name: String(form.get('name') ?? ''), company: String(form.get('company') ?? ''),
        email: String(form.get('email') ?? ''), phone: String(form.get('phone') ?? ''),
        message: String(form.get('message') ?? ''),
        product_slug: selectedProduct?.slug,
        quantity: selectedProduct && form.get('quantity') ? Number(form.get('quantity')) : undefined,
      })
      event.currentTarget.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const selectedTranslation = selectedProduct
    ? (selectedProduct.translations[locale] ?? selectedProduct.translations.en)
    : null
  const selectedImage = selectedProduct ? productAssetUrl(selectedProduct) : ''
  const defaultMessage = selectedTranslation
    ? (locale === 'hy' ? `Հետաքրքրված եմ «${selectedTranslation.name}» ապրանքով։ Խնդրում եմ ուղարկել գնային առաջարկ։` : `I am interested in “${selectedTranslation.name}”. Please send a commercial quote.`)
    : ''

  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.contact.eyebrow} title={managed.title || copy.contact.title} lead={managed.lead || copy.contact.lead} />
      <section className="section contact-section">
        <div className="container contact-grid">
          <form className="contact-form" onSubmit={submit}>
            <h2>{selectedProduct ? (locale === 'hy' ? 'Ապրանքի գնային առաջարկ' : 'Product quote request') : copy.contact.formTitle}</h2>
            {productState === 'loading' ? <div className="quote-product-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Ապրանքը բեռնվում է…' : 'Loading product…'}</div> : null}
            {selectedProduct && selectedTranslation ? <div className="quote-product-summary">
              <div className="quote-product-image">{selectedImage ? <img src={selectedImage} alt="" /> : <PackageSearch />}</div>
              <div><span>{locale === 'hy' ? 'Ընտրված ապրանք' : 'Selected product'}</span><strong>{selectedTranslation.name}</strong>{selectedProduct.sku ? <small>SKU · {selectedProduct.sku}</small> : null}</div>
              <Link to={`/products/${selectedProduct.slug}`}>{locale === 'hy' ? 'Դիտել' : 'View'}<ArrowRight /></Link>
            </div> : null}
            {productState === 'error' ? <p className="form-status error" role="alert">{locale === 'hy' ? 'Ընտրված ապրանքը չի գտնվել։ Կարող եք ուղարկել ընդհանուր հարցում։' : 'The selected product was not found. You can send a general inquiry.'}</p> : null}
            <div className="field-grid">
              <label><span>{copy.contact.name}</span><input name="name" required autoComplete="name" /></label>
              <label><span>{copy.contact.company}</span><input name="company" autoComplete="organization" /></label>
              <label><span>{copy.contact.email}</span><input name="email" type="email" required autoComplete="email" /></label>
              <label><span>{copy.contact.phone}</span><input name="phone" required autoComplete="tel" /></label>
              {selectedProduct ? <label><span>{locale === 'hy' ? 'Նախնական քանակ' : 'Estimated quantity'}</span><input name="quantity" type="number" min="1" max="1000000" inputMode="numeric" placeholder={locale === 'hy' ? 'Օրինակ՝ 10' : 'For example: 10'} /></label> : null}
            </div>
            <label><span>{copy.contact.message}</span><textarea key={selectedProduct?.slug ?? 'general'} name="message" rows={6} defaultValue={defaultMessage} required /></label>
            <button className="button button-primary dark-button" disabled={status === 'sending' || productState === 'loading'}>
              {status === 'sending' ? copy.contact.sending : copy.contact.submit}<Send size={17} />
            </button>
            {status === 'success' && <p className="form-status success" role="status">{copy.contact.success}</p>}
            {status === 'error' && <p className="form-status error" role="alert">{copy.contact.error}</p>}
          </form>

          <aside className="contact-aside">
            <h2>{copy.contact.details}</h2>
            <div className="contact-line"><Phone /><a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></div>
            <div className="contact-line"><Mail /><a href={`mailto:${company.email}`}>{company.email}</a></div>
            <div className="contact-line"><MapPin /><span>{locale === 'hy' ? company.addressHy : company.addressEn}</span></div>
            <div className="contact-separator" />
            <h3>{copy.contact.leadership}</h3>
            {company.team.map((person) => (
              <div className="direct-contact" key={person.email}>
                <strong>{locale === 'hy' ? person.nameHy : person.nameEn}</strong>
                <span>{locale === 'hy' ? person.roleHy : person.roleEn}</span>
                <a href={`tel:${person.phone.replace(/\s/g, '')}`}>{person.phone}</a>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </>
  )
}
