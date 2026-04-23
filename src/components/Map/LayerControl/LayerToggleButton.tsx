import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  label: string
  description?: string
  checked: boolean
  onToggle: () => void
}

export const LayerToggleButton = ({ id, label, description, checked, onToggle }: Props) => (
  <label
    htmlFor={id}
    className={cn(
      'flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-slate-800'
    )}
  >
    <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
    <div className="flex flex-col">
      <span className="text-sm">{label}</span>
      {description && (
        <span className="text-xs text-zinc-500 dark:text-slate-400">{description}</span>
      )}
    </div>
  </label>
)
