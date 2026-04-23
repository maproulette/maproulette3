interface Props {
  color: string
  label: string
}

export const LegendRow = ({ color, label }: Props) => (
  <li className="flex items-center gap-2 text-xs">
    <span
      aria-hidden="true"
      className="inline-block size-3 shrink-0 rounded-sm"
      style={{ backgroundColor: color }}
    />
    <span>{label}</span>
  </li>
)
