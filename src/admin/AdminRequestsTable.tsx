import type { ContactRequestRecord } from '../api'

export function AdminRequestsTable({ requests, onStatus }: {
  requests: ContactRequestRecord[]
  onStatus: (request: ContactRequestRecord, status: ContactRequestRecord['status']) => void
}) {
  return (
    <div className="request-table-wrap">
      <table className="request-table">
        <thead><tr><th>Կոնտակտ</th><th>Հաղորդագրություն</th><th>Ամսաթիվ</th><th>Կարգավիճակ</th></tr></thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td><strong>{request.name}</strong><a href={`mailto:${request.email}`}>{request.email}</a><span>{request.phone}</span></td>
              <td><p>{request.message}</p>{request.company && <span>{request.company}</span>}</td>
              <td>{new Intl.DateTimeFormat('hy-AM', { dateStyle: 'medium' }).format(new Date(request.created_at))}</td>
              <td>
                <select value={request.status} onChange={(event) => onStatus(request, event.target.value as ContactRequestRecord['status'])}>
                  <option value="new">Նոր</option>
                  <option value="in_progress">Ընթացքում</option>
                  <option value="completed">Ավարտված</option>
                  <option value="archived">Արխիվ</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
