import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SiteCopy } from '../content'

export function Eyebrow({ children }: { children: string }) {
  return <p className="eyebrow"><span />{children}</p>
}

export function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
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

export function ClosingCta({ copy }: { copy: SiteCopy }) {
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
