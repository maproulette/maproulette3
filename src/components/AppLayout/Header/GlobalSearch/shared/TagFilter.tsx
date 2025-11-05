import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  label: string
  icon?: LucideIcon
  availableTags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxVisible?: number
}

export const TagFilter = ({
  label,
  icon: Icon,
  availableTags,
  selectedTags,
  onChange,
  maxVisible = 5,
}: TagFilterProps) => {
  const [showAll, setShowAll] = useState(false)

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedTags.filter((t) => t !== tag))
  }

  const visibleTags = showAll ? availableTags : availableTags.slice(0, maxVisible)
  const hasMore = availableTags.length > maxVisible

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-300"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => handleRemoveTag(tag, e)}
                className="rounded-full transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggleTag(tag)}
            className={cn(
              'rounded-full border px-2.5 py-1 font-medium text-xs transition-all',
              selectedTags.includes(tag)
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="font-medium text-emerald-600 text-xs transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {showAll ? 'Show less' : `Show ${availableTags.length - maxVisible} more`}
        </button>
      )}
    </div>
  )
}
