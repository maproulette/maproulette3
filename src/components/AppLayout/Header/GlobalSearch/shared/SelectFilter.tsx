import type { LucideIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface SelectFilterProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  icon?: LucideIcon
  placeholder?: string
  disabled?: boolean
}

export const SelectFilter = ({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  placeholder,
  disabled = false,
}: SelectFilterProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 w-full">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent className="z-[60]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
