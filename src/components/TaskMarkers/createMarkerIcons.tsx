import { STATUS_CONFIG } from './const'

export const createMarkerIcons = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  const addIconsWhenReady = () => {
    if (!map.current) return

    Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
      const iconName = `marker-pin-${status}`
      if (map.current?.hasImage(iconName)) return

      const icon = new Image(24, 36)
      const pinSvg = `
        <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(pinSvg)}`
      icon.onload = () => {
        if (map.current && !map.current.hasImage(iconName)) {
          map.current.addImage(iconName, icon)
        }
      }
    })

    for (let taskCount = 2; taskCount <= 20; taskCount++) {
      const iconName = `marker-overlap-${taskCount}`
      if (map.current?.hasImage(iconName)) continue

      const icon = new Image(32, 48)
      const overlapPinSvg = `
        <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" 
                fill="#1e40af" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <text x="16" y="${taskCount >= 10 ? '21' : '22'}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${taskCount >= 10 ? '11' : '13'}" font-weight="bold" fill="#1e40af">${taskCount}</text>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(overlapPinSvg)}`
      icon.onload = () => {
        if (map.current && !map.current.hasImage(iconName)) {
          map.current.addImage(iconName, icon)
        }
      }
    }

    const genericOverlapIcon = new Image(32, 48)
    const genericOverlapSvg = `
      <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" 
              fill="#1e40af" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
        <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#1e40af">20+</text>
      </svg>`

    genericOverlapIcon.src = `data:image/svg+xml;base64,${btoa(genericOverlapSvg)}`
    genericOverlapIcon.onload = () => {
      if (map.current && !map.current.hasImage('marker-overlap-many')) {
        map.current.addImage('marker-overlap-many', genericOverlapIcon)
      }
    }
  }

  if (map.current.isStyleLoaded()) {
    addIconsWhenReady()
  } else {
    const onStyleLoad = () => {
      addIconsWhenReady()
      map.current?.off('styledata', onStyleLoad)
    }
    map.current.on('styledata', onStyleLoad)
  }
}
