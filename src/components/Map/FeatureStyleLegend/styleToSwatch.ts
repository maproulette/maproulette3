import type { CSSProperties } from 'react'

export const stylesToSwatch = (
  styles: { styleName: string; styleValue: string }[]
): CSSProperties => {
  const result: CSSProperties = { display: 'inline-block', width: 20, height: 12 }
  for (const { styleName, styleValue } of styles) {
    switch (styleName) {
      case 'stroke':
      case 'strokeColor':
        result.borderColor = styleValue
        result.borderStyle = 'solid'
        break
      case 'strokeWidth':
        result.borderWidth = `${styleValue}px`
        break
      case 'fill':
      case 'fillColor':
        result.backgroundColor = styleValue
        break
      case 'opacity':
      case 'fillOpacity':
        result.opacity = Number(styleValue)
        break
      default:
        break
    }
  }
  return result
}
