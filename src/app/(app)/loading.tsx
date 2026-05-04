export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-[var(--color-border)] rounded w-1/4 mb-10"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"></div>
        <div className="h-32 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"></div>
        <div className="h-32 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[500px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"></div>
        <div className="h-[500px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"></div>
      </div>
    </div>
  )
}

