export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-sm text-purple-400 border border-dashed border-purple-200 rounded-2xl bg-white/40">
      {message}
    </div>
  )
}
