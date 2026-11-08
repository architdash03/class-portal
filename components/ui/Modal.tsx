'use client'

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-purple-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rainbow-ring w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
          <h2 className="text-base font-semibold text-purple-950">{title}</h2>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-700 text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
