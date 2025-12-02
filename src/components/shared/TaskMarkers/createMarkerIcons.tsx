import { STATUS_CONFIG } from './const'

const DIFFICULTY_LETTERS = {
  0: 'H', // Expert - High
  1: 'M', // Normal - Medium
  2: 'L', // Easy - Low
}

export const createMarkerIcons = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  // Wait for style to be fully loaded before adding custom images
  // The vector tile style may not be ready immediately after map load
  // which will mess with adding custom objects
  const addIconsWhenReady = () => {
    if (!map.current) return

    // Helper function to create a marker icon with optional border
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

    // Create marker icons for each status and difficulty combination
    Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
      // Create icons for each difficulty level
      Object.entries(DIFFICULTY_LETTERS).forEach(([difficulty, letter]) => {
        // Normal icon
        createMarkerIcon(status, color, difficulty, letter)
        // Selected icon (yellow border)
        createMarkerIcon(status, color, difficulty, letter, '#eab308', 3)
        // Hovered icon (green border)
        createMarkerIcon(status, color, difficulty, letter, '#22c55e', 3)
      })
    })

    // Helper function to create overlap marker icons with optional border
    const createOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      borderColor?: string,
      borderWidth = 4
    ) => {
      if (map.current?.hasImage(iconName)) return

      const icon = new Image(40, 56)
      const displayText = typeof taskCount === 'number' ? String(taskCount) : taskCount
      const fontSize = typeof taskCount === 'number' && taskCount >= 10 ? '11' : '13'
      const textY = typeof taskCount === 'number' && taskCount >= 10 ? '21' : '22'

      const overlapPinSvg = borderColor
        ? `
        <svg width="40" height="56" viewBox="-4 -4 40 56" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" 
                fill="#1e40af" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <text x="16" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#1e40af">${displayText}</text>
        </svg>`
        : `
        <svg width="40" height="56" viewBox="-4 -4 40 56" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" 
                fill="#1e40af" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <text x="16" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#1e40af">${displayText}</text>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(overlapPinSvg)}`
      icon.onload = () => {
        if (map.current && !map.current.hasImage(iconName)) {
          map.current.addImage(iconName, icon)
        }
      }
    }

    // Create overlap marker icons - dark blue with task count
    for (let taskCount = 2; taskCount <= 20; taskCount++) {
      // Normal overlap icon
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}`)
      // Selected overlap icon (yellow border)
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-selected`, '#eab308', 3)
      // Hovered overlap icon (green border)
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-hovered`, '#22c55e', 3)
    }

    // Create generic overlap markers for counts > 20
    createOverlapIcon('20+', 'marker-overlap-many')
    createOverlapIcon('20+', 'marker-overlap-many-selected', '#eab308', 3)
    createOverlapIcon('20+', 'marker-overlap-many-hovered', '#22c55e', 3)
  }

  // Check if map is already loaded and style is ready
  if (map.current.isStyleLoaded()) {
    addIconsWhenReady()
  } else {
    // Wait for style to load
    const onStyleLoad = () => {
      addIconsWhenReady()
      map.current?.off('styledata', onStyleLoad)
    }
    map.current.on('styledata', onStyleLoad)
  }
}
