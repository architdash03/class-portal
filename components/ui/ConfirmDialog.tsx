'use client'

import Button from './Button'

export default function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-purple-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card rainbow-ring w-full max-w-sm p-5">
        <h2 className="text-base font-semibold text-purple-950 mb-2">{title}</h2>
        <p className="text-sm text-purple-700/80 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
