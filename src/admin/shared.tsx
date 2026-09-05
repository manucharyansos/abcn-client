import { LoaderCircle } from 'lucide-react'

export function AdminPageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="admin-page-heading"><div><p>{eyebrow}</p><h1>{title}</h1></div>{action}</div>
}

export function AdminLoading() {
  return <div className="admin-loading"><LoaderCircle className="spin" />Տվյալները բեռնվում են…</div>
}

export function AdminError({ message }: { message: string }) {
  return message ? <div className="admin-error" role="alert">{message}</div> : null
}

export function AdminSuccess({ message }: { message: string }) {
  return message ? <div className="admin-success" role="status">{message}</div> : null
}

export function Pagination({ current, last, onChange }: { current: number; last: number; onChange: (page: number) => void }) {
  if (last <= 1) return null
  return (
    <div className="admin-pagination">
      <button disabled={current <= 1} onClick={() => onChange(current - 1)}>Նախորդ</button>
      <span>{current} / {last}</span>
      <button disabled={current >= last} onClick={() => onChange(current + 1)}>Հաջորդ</button>
    </div>
  )
}
