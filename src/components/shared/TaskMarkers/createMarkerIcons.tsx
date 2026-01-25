import { STATUS_CONFIG } from './const'

const DIFFICULTY_LETTERS = {
  0: 'H',
  1: 'M',
  2: 'L',
}

export const createMarkerIcons = (map: React.RefObject<maplibregl.Map | null>, onComplete?: () => void) => {
  if (!map.current) return

  console.log('[createMarkerIcons] Starting icon creation...')
  let iconsCreated = 0
  let iconsLoaded = 0
  let callbackFired = false
  const totalExpectedIcons = Object.keys(STATUS_CONFIG).length * 3 * 7 + 7 * 19 * 2 + 14 // rough estimate

  const addIconsWhenReady = () => {
    const currentMap = map.current
    if (!currentMap) return

    const getBorderSuffix = (borderColor: string): string => {
      switch (borderColor) {
        case '#8b5cf6':
          return 'selected' // Purple - popup selected
        case '#22c55e':
          return 'bundled' // Green - primary/bundled tasks
        case '#eab308':
          return 'lasso' // Yellow - lasso selected
        default:
          return 'selected'
      }
    }

    const createMarkerIcon = (
      status: string,
      color: string,
      difficulty: string,
      letter: string,
      borderColor?: string,
      borderWidth = 4,
      suffixOverride?: string
    ) => {
      const iconName = borderColor
        ? `marker-pin-${status}-${difficulty}-${suffixOverride ?? getBorderSuffix(borderColor)}`
        : `marker-pin-${status}-${difficulty}`

      // Remove existing icon if it exists (to allow updating with new colors)
      if (currentMap.hasImage(iconName)) {
        try {
          currentMap.removeImage(iconName)
        } catch (error) {
          // Ignore errors if image doesn't exist or can't be removed
        }
      }

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
        // Capture map reference at load time to avoid stale closure
        const mapInstance = map.current
        if (mapInstance && !mapInstance.hasImage(iconName)) {
          try {
            mapInstance.addImage(iconName, icon)
            iconsLoaded++
            console.log(`[createMarkerIcons] Icon loaded: ${iconName} (${iconsLoaded} total)`)
            if (onComplete && iconsLoaded >= 20 && !callbackFired) {
              // Trigger callback once after some icons are ready
              callbackFired = true
              onComplete()
            }
          } catch (error) {
            console.warn('Failed to add marker icon:', error)
          }
        }
      }
      icon.onerror = () => {
        console.warn('Failed to load marker icon:', iconName)
      }
      iconsCreated++
    }

    // Create dual-border marker icon (for bundled + selected state)
    const createDualBorderMarkerIcon = (
      status: string,
      color: string,
      difficulty: string,
      letter: string,
      outerColor: string,
      innerColor: string,
      suffix: string
    ) => {
      const iconName = `marker-pin-${status}-${difficulty}-${suffix}`

      if (currentMap.hasImage(iconName)) {
        try {
          currentMap.removeImage(iconName)
        } catch (error) {
          // Ignore errors
        }
      }

      const icon = new Image(32, 44)
      // Create SVG with two borders - outer and inner
      const pinSvg = `
        <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
                fill="${color}" stroke="${outerColor}" stroke-width="5" stroke-linejoin="round"/>
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
                fill="none" stroke="${innerColor}" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="7" fill="white"/>
          <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}">${letter}</text>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(pinSvg)}`
      icon.onload = () => {
        const mapInstance = map.current
        if (mapInstance && !mapInstance.hasImage(iconName)) {
          try {
            mapInstance.addImage(iconName, icon)
            iconsLoaded++
            console.log(`[createMarkerIcons] Dual icon loaded: ${iconName} (${iconsLoaded} total)`)
          } catch (error) {
            console.warn('Failed to add dual-border marker icon:', error)
          }
        }
      }
      icon.onerror = () => {
        console.warn('Failed to load dual-border marker icon:', iconName)
      }
      iconsCreated++
    }

    console.log(`[createMarkerIcons] Creating status/difficulty icons...`)
    Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
      Object.entries(DIFFICULTY_LETTERS).forEach(([difficulty, letter]) => {
        // Normal marker
        createMarkerIcon(status, color, difficulty, letter)

        // Selected marker with purple border (popup selected)
        createMarkerIcon(status, color, difficulty, letter, '#8b5cf6', 3)

        // Bundled marker with green border (primary/bundled tasks)
        createMarkerIcon(status, color, difficulty, letter, '#22c55e', 3)

        // Hovered marker with green border (backward compatibility for other pages)
        createMarkerIcon(status, color, difficulty, letter, '#22c55e', 3, 'hovered')

        // Lasso selected marker with yellow border
        createMarkerIcon(status, color, difficulty, letter, '#eab308', 3)

        // Bundled + selected marker (dual border: purple outer, green inner)
        createDualBorderMarkerIcon(status, color, difficulty, letter, '#8b5cf6', '#22c55e', 'bundled-selected')

        // Lasso + selected marker (dual border: purple outer, yellow inner)
        createDualBorderMarkerIcon(status, color, difficulty, letter, '#8b5cf6', '#eab308', 'lasso-selected')
      })
    })

    const createOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      borderColor?: string,
      borderWidth = 4
    ) => {
      // Remove existing icon if it exists (to allow updating with new colors)
      if (currentMap.hasImage(iconName)) {
        try {
          currentMap.removeImage(iconName)
        } catch (error) {
          // Ignore errors if image doesn't exist or can't be removed
        }
      }

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
        // Capture map reference at load time to avoid stale closure
        const mapInstance = map.current
        if (mapInstance && !mapInstance.hasImage(iconName)) {
          try {
            mapInstance.addImage(iconName, icon)
          } catch (error) {
            console.warn('Failed to add overlap marker icon:', error)
          }
        }
      }
      icon.onerror = () => {
        console.warn('Failed to load overlap marker icon:', iconName)
      }
    }

    // Create dual-border overlap icon (for bundled + selected state)
    const createDualBorderOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      outerColor: string,
      innerColor: string
    ) => {
      if (currentMap.hasImage(iconName)) {
        try {
          currentMap.removeImage(iconName)
        } catch (error) {
          // Ignore errors
        }
      }

      const icon = new Image(32, 44)
      const displayText = typeof taskCount === 'number' ? String(taskCount) : taskCount
      const fontSize = typeof taskCount === 'number' && taskCount >= 10 ? '9' : '10'
      const textY = typeof taskCount === 'number' && taskCount >= 10 ? '15' : '16'
      const darkBlue = '#1e3a8a'

      const overlapPinSvg = `
        <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
                fill="${darkBlue}" stroke="${outerColor}" stroke-width="5" stroke-linejoin="round"/>
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
                fill="none" stroke="${innerColor}" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="7" fill="white"/>
          <text x="12" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${darkBlue}">${displayText}</text>
        </svg>`

      icon.src = `data:image/svg+xml;base64,${btoa(overlapPinSvg)}`
      icon.onload = () => {
        const mapInstance = map.current
        if (mapInstance && !mapInstance.hasImage(iconName)) {
          try {
            mapInstance.addImage(iconName, icon)
          } catch (error) {
            console.warn('Failed to add dual-border overlap icon:', error)
          }
        }
      }
      icon.onerror = () => {
        console.warn('Failed to load dual-border overlap icon:', iconName)
      }
    }

    for (let taskCount = 2; taskCount <= 20; taskCount++) {
      // Normal overlap marker
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}`)

      // Popup selected with purple border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-selected`, '#8b5cf6', 3)

      // Bundled with green border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-bundled`, '#22c55e', 3)

      // Hovered with green border (backward compatibility for other pages)
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-hovered`, '#22c55e', 3)

      // Lasso selected with yellow border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-lasso`, '#eab308', 3)

      // Bundled + selected with dual border (purple outer, green inner)
      createDualBorderOverlapIcon(taskCount, `marker-overlap-${taskCount}-bundled-selected`, '#8b5cf6', '#22c55e')

      // Lasso + selected with dual border (purple outer, yellow inner)
      createDualBorderOverlapIcon(taskCount, `marker-overlap-${taskCount}-lasso-selected`, '#8b5cf6', '#eab308')
    }

    // "Many" overlap markers (20+)
    createOverlapIcon('20+', 'marker-overlap-many')
    createOverlapIcon('20+', 'marker-overlap-many-selected', '#8b5cf6', 3)
    createOverlapIcon('20+', 'marker-overlap-many-bundled', '#22c55e', 3)
    createOverlapIcon('20+', 'marker-overlap-many-hovered', '#22c55e', 3)
    createOverlapIcon('20+', 'marker-overlap-many-lasso', '#eab308', 3)
    createDualBorderOverlapIcon('20+', 'marker-overlap-many-bundled-selected', '#8b5cf6', '#22c55e')
    createDualBorderOverlapIcon('20+', 'marker-overlap-many-lasso-selected', '#8b5cf6', '#eab308')
  }

  const currentMap = map.current
  if (!currentMap) return

  if (currentMap.isStyleLoaded()) {
    addIconsWhenReady()
  } else {
    const onStyleLoad = () => {
      if (map.current) {
        addIconsWhenReady()
        map.current.off('styledata', onStyleLoad)
      }
    }
    currentMap.on('styledata', onStyleLoad)
  }
}
