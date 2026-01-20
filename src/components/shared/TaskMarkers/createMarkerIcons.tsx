import { STATUS_CONFIG } from './const'

const DIFFICULTY_LETTERS = {
  0: 'H',
  1: 'M',
  2: 'L',
}

export const createMarkerIcons = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  const addIconsWhenReady = () => {
    if (!map.current) return

    const createMarkerIcon = (
      status: string,
      color: string,
      difficulty: string,
      letter: string,
      borderColor?: string,
      borderWidth = 4
    ) => {
      const iconName = borderColor
        ? `marker-pin-${status}-${difficulty}-${borderColor === '#eab308' ? 'selected' : 'hovered'}`
        : `marker-pin-${status}-${difficulty}`

      if (map.current?.hasImage(iconName)) return

      const icon = new Image(32, 44)
      const pinSvg = borderColor
        ? `
          <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                  fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="7" fill="white"/>
            <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}">${letter}</text>
          </svg>`
        : `
          <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                  fill="${color}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="7" fill="white"/>
            <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}">${letter}</text>
          </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(pinSvg)}`
      icon.onload = () => {
        if (map.current && !map.current.hasImage(iconName)) {
          map.current.addImage(iconName, icon)
        }
      }
    }

    Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
      Object.entries(DIFFICULTY_LETTERS).forEach(([difficulty, letter]) => {
        createMarkerIcon(status, color, difficulty, letter)

        createMarkerIcon(status, color, difficulty, letter, '#eab308', 3)

        createMarkerIcon(status, color, difficulty, letter, '#22c55e', 3)
      })
    })

    const createOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      borderColor?: string,
      borderWidth = 4
    ) => {
      if (map.current?.hasImage(iconName)) return

      // Use same size as TaskPin (32x44) and dark blue color
      const icon = new Image(32, 44)
      const displayText = typeof taskCount === 'number' ? String(taskCount) : taskCount
      const fontSize = typeof taskCount === 'number' && taskCount >= 10 ? '9' : '10'
      const textY = typeof taskCount === 'number' && taskCount >= 10 ? '15' : '16'
      // Dark blue color - using a darker shade for better visibility
      const darkBlue = '#1e3a8a'

      const overlapPinSvg = borderColor
        ? `
        <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                fill="${darkBlue}" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="7" fill="white"/>
          <text x="12" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${darkBlue}">${displayText}</text>
        </svg>`
        : `
        <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" 
                fill="${darkBlue}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="7" fill="white"/>
          <text x="12" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${darkBlue}">${displayText}</text>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(overlapPinSvg)}`
      icon.onload = () => {
        if (map.current && !map.current.hasImage(iconName)) {
          map.current.addImage(iconName, icon)
        }
      }
    }

    for (let taskCount = 2; taskCount <= 20; taskCount++) {
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}`)

      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-selected`, '#eab308', 3)

      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-hovered`, '#22c55e', 3)
    }

    createOverlapIcon('20+', 'marker-overlap-many')
    createOverlapIcon('20+', 'marker-overlap-many-selected', '#eab308', 3)
    createOverlapIcon('20+', 'marker-overlap-many-hovered', '#22c55e', 3)
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
