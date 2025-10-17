import { STATUS_CONFIG } from './const'

export const createMarkerIcons = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
    const iconName = `marker-pin-${status}`
    if (map.current!.hasImage(iconName)) return

    const icon = new Image(24, 36)
    const pinSvg = `
        <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>`

    icon.src = 'data:image/svg+xml;base64,' + btoa(pinSvg)
    icon.onload = () => {
      if (map.current && !map.current.hasImage(iconName)) {
        map.current.addImage(iconName, icon)
      }
    }
  })
}
