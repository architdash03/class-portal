import type { ClassInformation } from '@/types/database'

export default function InfoTable({ rows }: { rows: ClassInformation[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-purple-400">No class information has been written yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-100">
      <table className="info-table">
        <thead>
          <tr>
            <th className="w-1/3">Topic</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="font-semibold">{row.title}</td>
              <td className="whitespace-pre-wrap">{row.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
