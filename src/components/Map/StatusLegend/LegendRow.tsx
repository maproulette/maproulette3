interface Props {
  color?: string
  letter?: string
  label: string
}

export const LegendRow = ({ color, letter, label }: Props) => (
  <li className="flex items-center gap-2 text-xs">
    {letter ? (
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm bg-zinc-200 font-bold text-[10px] text-zinc-700 dark:bg-slate-700 dark:text-zinc-200"
      >
        {letter}
      </span>
    ) : (
      <span
        aria-hidden="true"
        className="inline-block size-3 shrink-0 rounded-sm"
        style={{ backgroundColor: color }}
      />
    )}
    <span>{label}</span>
  </li>
)
