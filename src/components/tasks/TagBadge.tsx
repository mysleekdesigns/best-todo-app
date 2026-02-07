import { cn } from '@/lib/utils'

interface TagBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  onRemove?: () => void
  className?: string
}

export function TagBadge({ name, color, size = 'sm', onRemove, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
        size === 'md' && 'px-2 py-0.5 text-xs',
        className,
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' && 'h-1.5 w-1.5',
          size === 'md' && 'h-2 w-2',
        )}
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
          aria-label={`Remove tag ${name}`}
        >
          <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      )}
    </span>
  )
}
