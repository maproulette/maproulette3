/**
 * Creates popup content for a single OSM feature
 */
const createSingleFeatureContent = (properties: Record<string, unknown>): HTMLElement => {
  const type = String(properties.type ?? '')
  const id = String(properties.id ?? '')

  const featureDiv = document.createElement('div')
  featureDiv.className = 'mb-4 last:mb-0'

  // Header with link to OSM
  const header = document.createElement('div')
  header.className = 'mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-700'
  const link = document.createElement('a')
  link.href = `https://www.openstreetmap.org/${type}/${id}`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.className =
    'text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-sm underline'
  link.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}`
  header.appendChild(link)
  featureDiv.appendChild(header)

  // Properties list (excluding id, type, _highlighted)
  const propsList = document.createElement('div')
  propsList.className = 'space-y-1 text-xs mt-2'

  const filteredProps = Object.entries(properties)
    .filter(([key]) => !['id', 'type', '_highlighted'].includes(key))
    .sort(([a], [b]) => a.localeCompare(b))

  if (filteredProps.length === 0) {
    const noProps = document.createElement('div')
    noProps.className = 'text-zinc-500 dark:text-zinc-400 italic text-xs py-1'
    noProps.textContent = 'No additional properties'
    propsList.appendChild(noProps)
  } else {
    filteredProps.forEach(([key, value]) => {
      const propDiv = document.createElement('div')
      propDiv.className =
        'flex justify-between gap-3 py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0'
      const keySpan = document.createElement('span')
      keySpan.className = 'font-medium text-zinc-700 dark:text-zinc-300 text-left'
      keySpan.textContent = key
      const valueSpan = document.createElement('span')
      valueSpan.className = 'text-zinc-600 dark:text-zinc-400 text-right break-words max-w-[60%]'
      valueSpan.textContent = String(value)
      propDiv.appendChild(keySpan)
      propDiv.appendChild(valueSpan)
      propsList.appendChild(propDiv)
    })
  }
  featureDiv.appendChild(propsList)

  return featureDiv
}

/**
 * Creates popup content for multiple OSM features
 */
export const createPopupContent = (features: GeoJSON.Feature[]): HTMLElement => {
  const popupContent = document.createElement('div')
  popupContent.className = 'p-4 max-w-xs max-h-[400px] overflow-y-auto'

  if (features.length === 1) {
    // Single feature - use original layout
    const feature = features[0]
    const type = String(feature.properties?.type ?? '')
    const id = String(feature.properties?.id ?? '')

    const header = document.createElement('div')
    header.className = 'mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700'
    const link = document.createElement('a')
    link.href = `https://www.openstreetmap.org/${type}/${id}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.className =
      'text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-base underline'
    link.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}`
    header.appendChild(link)
    popupContent.appendChild(header)

    const propsList = document.createElement('div')
    propsList.className = 'space-y-1.5 text-sm mt-2'

    const filteredProps = Object.entries(feature.properties || {})
      .filter(([key]) => !['id', 'type', '_highlighted'].includes(key))
      .sort(([a], [b]) => a.localeCompare(b))

    if (filteredProps.length === 0) {
      const noProps = document.createElement('div')
      noProps.className = 'text-zinc-500 dark:text-zinc-400 italic text-xs py-2'
      noProps.textContent = 'No additional properties'
      propsList.appendChild(noProps)
    } else {
      filteredProps.forEach(([key, value]) => {
        const propDiv = document.createElement('div')
        propDiv.className =
          'flex justify-between gap-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0'
        const keySpan = document.createElement('span')
        keySpan.className = 'font-medium text-zinc-700 dark:text-zinc-300 text-left'
        keySpan.textContent = key
        const valueSpan = document.createElement('span')
        valueSpan.className = 'text-zinc-600 dark:text-zinc-400 text-right break-words max-w-[60%]'
        valueSpan.textContent = String(value)
        propDiv.appendChild(keySpan)
        propDiv.appendChild(valueSpan)
        propsList.appendChild(propDiv)
      })
    }
    popupContent.appendChild(propsList)
  } else {
    // Multiple features - show count and list
    const header = document.createElement('div')
    header.className = 'mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700'
    const title = document.createElement('div')
    title.className = 'font-semibold text-base text-zinc-900 dark:text-zinc-100'
    title.textContent = `${features.length} overlapping features`
    header.appendChild(title)
    popupContent.appendChild(header)

    features.forEach((feature) => {
      const featureContent = createSingleFeatureContent(feature.properties || {})
      popupContent.appendChild(featureContent)
    })
  }

  return popupContent
}
