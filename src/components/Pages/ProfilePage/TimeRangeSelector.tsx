import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { useProfilePageContext } from './contexts/ProfilePageContext'

const presets: Array<{ label: string; monthDuration: number }> = [
  { label: '1m', monthDuration: 1 },
  { label: '3m', monthDuration: 3 },
  { label: '6m', monthDuration: 6 },
  { label: '9m', monthDuration: 9 },
  { label: '12m', monthDuration: 12 },
  { label: 'All', monthDuration: -1 },
]

export const TimeRangeSelector = () => {
  const { timeRange, setMonthDuration } = useProfilePageContext()

  return (
    <ToggleGroup
      type="single"
      value={String(timeRange.monthDuration)}
      onValueChange={(value) => {
        if (!value) return
        setMonthDuration(Number(value))
      }}
      aria-label="Time range"
    >
      {presets.map((preset) => (
        <ToggleGroupItem key={preset.monthDuration} value={String(preset.monthDuration)}>
          {preset.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
