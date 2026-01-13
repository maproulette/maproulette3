export const getTaskFeatureId = (feature: GeoJSON.Feature): string | undefined => {
  return feature.id !== undefined
    ? String(feature.id)
    : feature.properties?.id !== undefined
      ? String(feature.properties.id)
      : undefined
}

export const isValidTaskFeature = (
  feature: GeoJSON.Feature & { layer?: { id?: string } }
): boolean => {
  // Skip cluster features
  const layerId = feature.layer?.id
  if (layerId?.includes('cluster')) {
    return false
  }
  return feature.properties?.id !== undefined
}
