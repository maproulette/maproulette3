import { styleRuleToText, type TaskStyleRule } from './styleRuleToText'
import { stylesToSwatch } from './styleToSwatch'

interface Props {
  rule: TaskStyleRule
}

export const LegendEntry = ({ rule }: Props) => {
  const swatchStyle = stylesToSwatch(rule.styles)
  const description = styleRuleToText(rule.propertySearch)
  return (
    <li className="flex items-center gap-2 text-xs">
      <span style={swatchStyle} aria-hidden="true" className="rounded-sm" />
      <span className="font-mono">{description}</span>
    </li>
  )
}
