import { type FormEvent, useState } from 'react'
import {
  ArrowRight, Cable, ChevronRight, CircleGauge, FileText,
  Layers3, Mail, MapPin, Network, Phone, Send, SlidersHorizontal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { company, type Locale, type SiteCopy } from '../content'

const directionIcons = [Cable, SlidersHorizontal, CircleGauge, Network]

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

export function HomePage({ copy }: { copy: SiteCopy }) {
  return (
    <>
      <section className="home-hero">
        <img className="home-hero-image" src="/images/abcn-hero.webp" alt="" />
        <div className="home-hero-shade" />
        <div className="container home-hero-content">
          <Eyebrow>{copy.hero.eyebrow}</Eyebrow>
          <h1>{copy.hero.title}</h1>
          <p className="hero-lead">{copy.hero.body}</p>
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
            <p>{copy.intro.body}</p>
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

export function AboutPage({ copy }: { copy: SiteCopy }) {
  return (
    <>
      <PageHero eyebrow={copy.about.eyebrow} title={copy.about.title} lead={copy.about.lead} />
      <section className="section">
        <div className="container editorial-grid">
          <div className="editorial-index">01</div>
          <div><h2>{copy.about.storyTitle}</h2><p className="large-copy">{copy.about.story}</p></div>
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

export function SolutionsPage({ copy }: { copy: SiteCopy }) {
  return (
    <>
      <PageHero eyebrow={copy.solutionsPage.eyebrow} title={copy.solutionsPage.title} lead={copy.solutionsPage.lead} />
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
          <div><h2>{copy.solutionsPage.noteTitle}</h2><p>{copy.solutionsPage.note}</p></div>
        </div>
      </section>
      <ClosingCta copy={copy} />
    </>
  )
}

export function ProductsPage({ copy }: { copy: SiteCopy }) {
  const icons = [Layers3, SlidersHorizontal, FileText, Send]
  return (
    <>
      <PageHero eyebrow={copy.productsPage.eyebrow} title={copy.productsPage.title} lead={copy.productsPage.lead} />
      <section className="section products-preview">
        <div className="container">
          <div className="catalog-status"><span className="status-dot" />{copy.productsPage.status}</div>
          <div className="product-feature-grid">
            {copy.productsPage.features.map(([title, text], index) => {
              const Icon = icons[index]
              return <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>
            })}
          </div>
          <Link className="button button-primary dark-button" to="/contact">{copy.productsPage.action}<ArrowRight size={18} /></Link>
        </div>
      </section>
      <ClosingCta copy={copy} />
    </>
  )
}

export function ContactPage({ copy, locale }: { copy: SiteCopy; locale: Locale }) {
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
      <PageHero eyebrow={copy.contact.eyebrow} title={copy.contact.title} lead={copy.contact.lead} />
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
            <label><span>{copy.contact.message}</span><textarea name="message" rows={6} required /></label>
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
