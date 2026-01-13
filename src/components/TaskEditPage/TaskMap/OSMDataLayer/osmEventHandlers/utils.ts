export const getFeatureId = (feature: GeoJSON.Feature): string | undefined => {
  return feature.id !== undefined
    ? String(feature.id)
    : feature.properties?.id !== undefined
      ? String(feature.properties.id)
      : undefined
}

export const isValidOSMFeature = (feature: GeoJSON.Feature): boolean => {
  const type = feature.properties?.type
  return type === 'way' || type === 'area' || type === 'node'
}
