import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-accent p-4">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
