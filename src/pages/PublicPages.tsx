import { type FormEvent, type MouseEvent as ReactMouseEvent, useEffect, useState } from 'react'
import {
  ArrowRight, Cable, ChevronRight, CircleGauge, FileText,
  Layers3, LoaderCircle, Mail, MapPin, Network, PackageSearch, Phone, RotateCw, ScanSearch, Send, SlidersHorizontal,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, type AdminPage, type PageLocaleContent, type Product, type ProductCategory } from '../api'
import { company, type Locale, type SiteCopy } from '../content'

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

function categoryBranchIds(category: ProductCategory): number[] {
  return [category.id, ...(category.children ?? []).flatMap(categoryBranchIds)]
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

function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const translation = product.translations[locale] ?? product.translations.en
  const image = productAssetUrl(product)

  return <Link className="public-product-card" to={`/products/${product.slug}`}>
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
}

type ProductInfoTab = 'overview' | 'specifications' | 'documents'

function ProductInformation({ product, locale, productName, description }: { product: Product; locale: Locale; productName: string; description: string }) {
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
      <Link className="button button-primary dark-button" to={`/contact?product=${encodeURIComponent(productName)}`}>{locale === 'hy' ? 'Ստանալ առաջարկ' : 'Request a quote'}<ArrowRight /></Link>
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [catalogError, setCatalogError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([api.getPublicProducts(), api.getPublicCategories()]).then(([productData, categoryData]) => {
      if (!active) return
      setProducts(productData.data)
      setCategories(categoryData)
      setCurrentPage(productData.current_page)
      setLastPage(productData.last_page)
    }).catch(() => { if (active) setCatalogError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadKey])

  function retryCatalog() {
    setLoading(true)
    setCatalogError(false)
    setProducts([])
    setReloadKey((value) => value + 1)
  }

  async function loadMore() {
    if (loadingMore || currentPage >= lastPage) return
    setLoadingMore(true)
    setCatalogError(false)
    try {
      const result = await api.getPublicProducts(currentPage + 1)
      setProducts((current) => [...current, ...result.data])
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
    } catch {
      setCatalogError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  const flatCategories = flattenCategories(categories)
  const selectedCategoryRecord = flatCategories.find((category) => category.id === selectedCategory)
  const activeRootId = selectedCategoryRecord?.parent_id ?? selectedCategoryRecord?.id ?? null
  const activeRoot = categories.find((category) => category.id === activeRootId)
  const selectedCategoryIds = selectedCategoryRecord ? new Set(categoryBranchIds(selectedCategoryRecord)) : null
  const visibleProducts = selectedCategoryIds
    ? products.filter((product) => product.product_category_id !== null && selectedCategoryIds.has(product.product_category_id))
    : products
  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.productsPage.eyebrow} title={managed.title || copy.productsPage.title} lead={managed.lead || copy.productsPage.lead} />
      <section className="section products-preview">
        <div className="container">
          {loading && <div className="catalog-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Կատալոգը բեռնվում է…' : 'Loading catalog…'}</div>}
          {!loading && catalogError && products.length === 0 ? <div className="catalog-message" role="alert">
            <PackageSearch />
            <h2>{locale === 'hy' ? 'Կատալոգը ժամանակավորապես հասանելի չէ' : 'The catalog is temporarily unavailable'}</h2>
            <p>{locale === 'hy' ? 'Փորձեք կրկին կամ կապվեք մեզ հետ՝ ապրանքի մասին տեղեկություն ստանալու համար։' : 'Try again or contact us for product information.'}</p>
            <button className="button button-outline-blue" type="button" onClick={retryCatalog}><RotateCw />{locale === 'hy' ? 'Փորձել կրկին' : 'Try again'}</button>
          </div> : null}
          {!loading && products.length > 0 ? <>
            <div className="catalog-filter-groups">
              <div className="catalog-filters" aria-label={locale === 'hy' ? 'Ապրանքների կատեգորիաներ' : 'Product categories'}>
                <button className={selectedCategory === null ? 'active' : ''} onClick={() => setSelectedCategory(null)}>{locale === 'hy' ? 'Բոլորը' : 'All products'}</button>
                {categories.map((category) => <button key={category.id} className={activeRoot?.id === category.id ? 'active' : ''} onClick={() => setSelectedCategory(category.id)}>{category.translations[locale]?.name || category.translations.en.name}</button>)}
              </div>
              {activeRoot?.children?.length ? <div className="catalog-subfilters" aria-label={locale === 'hy' ? 'Ապրանքների ենթակատեգորիաներ' : 'Product subcategories'}>
                <span>{locale === 'hy' ? 'Ենթակատեգորիաներ' : 'Subcategories'}</span>
                <button className={selectedCategory === activeRoot.id ? 'active' : ''} onClick={() => setSelectedCategory(activeRoot.id)}>{locale === 'hy' ? 'Բոլորը բաժնում' : 'All in category'}</button>
                {activeRoot.children.map((category) => <button key={category.id} className={selectedCategory === category.id ? 'active' : ''} onClick={() => setSelectedCategory(category.id)}>{category.translations[locale]?.name || category.translations.en.name}</button>)}
              </div> : null}
            </div>
            {visibleProducts.length ? <div className="public-product-grid">{visibleProducts.map((product) => <ProductCard product={product} locale={locale} key={product.id} />)}</div> : <div className="catalog-empty">{locale === 'hy' ? 'Այս կատեգորիայում ապրանք դեռ չկա։' : 'There are no products in this category yet.'}</div>}
            {currentPage < lastPage ? <button className="button catalog-more" type="button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? <LoaderCircle className="spin" /> : null}{loadingMore ? (locale === 'hy' ? 'Բեռնվում է…' : 'Loading…') : (locale === 'hy' ? 'Ցույց տալ ավելին' : 'Show more')}</button> : null}
            {catalogError ? <p className="catalog-inline-error" role="alert">{locale === 'hy' ? 'Հաջորդ ապրանքները չբեռնվեցին։ Փորձեք կրկին։' : 'More products could not be loaded. Please try again.'}</p> : null}
          </> : !loading && !catalogError && <>
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
        <ProductInformation product={product} locale={locale} productName={translation.name} description={translation.description || copy.productsPage.lead} key={product.id} />
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
  const productName = searchParams.get('product')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

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
      })
      event.currentTarget.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PageHero eyebrow={managed.eyebrow || copy.contact.eyebrow} title={managed.title || copy.contact.title} lead={managed.lead || copy.contact.lead} />
      <section className="section contact-section">
        <div className="container contact-grid">
          <form className="contact-form" onSubmit={submit}>
            <h2>{copy.contact.formTitle}</h2>
            <div className="field-grid">
              <label><span>{copy.contact.name}</span><input name="name" required autoComplete="name" /></label>
              <label><span>{copy.contact.company}</span><input name="company" autoComplete="organization" /></label>
              <label><span>{copy.contact.email}</span><input name="email" type="email" required autoComplete="email" /></label>
              <label><span>{copy.contact.phone}</span><input name="phone" required autoComplete="tel" /></label>
            </div>
            <label><span>{copy.contact.message}</span><textarea name="message" rows={6} defaultValue={productName ? (locale === 'hy' ? `Հետաքրքրված եմ «${productName}» ապրանքով։` : `I am interested in “${productName}”.`) : ''} required /></label>
            <button className="button button-primary dark-button" disabled={status === 'sending'}>
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
