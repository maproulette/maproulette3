import { STATUS_CONFIG } from './const'

const PIXEL_RATIO = 4

const DIFFICULTY_SVG: Record<number, string> = {
  0: `<path data-name="High" fill="#000000" d="M10.2,17.25 L10.2,9.64 L11.8276944,9.64 L11.8276944,17.25 L10.2,17.25 Z M15.1253611,17.25 L15.1253611,9.64 L16.7530556,9.64 L16.7530556,17.25 L15.1253611,17.25 Z M10.961,12.6628611 L15.8652222,12.6628611 L15.8652222,13.9100556 L10.961,13.9100556 L10.961,12.6628611 Z"/>`,
  1: `<polygon data-name="Medium" fill="#000000" points="9.273 17.25 9.273 9.641 11.809 9.641 13.467 16.219 15.117 9.641 17.663 9.641 17.663 17.25 16.058 17.25 16.058 10.159 14.272 17.25 12.59 17.25 10.816 10.159 10.816 17.25"/>`,
  2: `<path data-name="Low" fill="#000000" d="M10.9,17.25 L10.9,9.64 L12.5276944,9.64 L12.5276944,17.25 L10.9,17.25 Z M11.661,17.25 L11.661,16.0028056 L16.1847222,16.0028056 L16.1847222,17.25 L11.661,17.25 Z"/>`,
}

const BG_PATH =
  'M2.5,14.8001594 C2.5,18.0978578 3.35630335,20.5402912 5.50868313,23.5355445 C5.52719928,23.5613116 7.45112679,26.0422944 8.30657284,27.1640812 C8.3765299,27.2558499 8.3765299,27.2558499 8.44645166,27.3476997 C9.55271803,28.8014241 10.3631867,29.9029307 10.8139652,30.5815314 C11.4897184,31.5988082 12.1031817,32.6194663 12.6736251,33.6787945 C13.1630732,34.1070685 13.8369268,34.1070685 14.326375,33.6787944 C14.8968182,32.6194666 15.5102815,31.5988085 16.1860348,30.5815314 C16.6368133,29.9029307 17.4472819,28.8014241 18.5535483,27.3476997 C18.6234701,27.2558499 18.6234701,27.2558499 18.6934271,27.1640812 C19.5488733,26.0422943 21.4728008,23.5613115 21.4913169,23.5355444 C23.6436967,20.5402912 24.5,18.0978578 24.5,14.8001594 C24.5,7.70712432 19.5553889,2 13.5,2 C7.44461108,2 2.5,7.70712431 2.5,14.8001594 Z'

const BORDER_PATH =
  'M26.5,14.8001594 C26.5,18.5359281 25.5026664,21.3806221 23.1154655,24.7026525 C23.0719184,24.7632527 21.1168716,27.2843651 20.283777,28.3768415 C20.2144135,28.4678314 20.2144135,28.4678314 20.1451151,28.5588624 C19.0646506,29.9786811 18.27126,31.0569769 17.8519708,31.6881736 C17.2099278,32.6547034 16.6281975,33.6225654 16.0872923,34.6270403 L16.0015084,34.7863433 C15.9447797,34.8916901 15.8696054,34.9860011 15.7795603,35.0647919 L15.6433962,35.1839374 C14.3998922,36.2720209 12.6001078,36.2720209 11.3566038,35.1839374 L11.2204397,35.0647919 C11.1303946,34.9860011 11.0552203,34.8916901 10.9984916,34.7863433 L10.9127077,34.6270403 C10.3718024,33.6225651 9.79007204,32.6547031 9.14802915,31.6881736 C8.72873994,31.0569769 7.93534938,29.9786811 6.85488487,28.5588624 C6.78558643,28.4678314 6.78558643,28.4678314 6.71622299,28.3768415 C5.88312845,27.2843652 3.92808163,24.7632528 3.88453453,24.7026526 C1.49733361,21.3806221 0.5,18.5359281 0.5,14.8001594 C0.5,6.66120274 6.2712177,0 13.5,0 C20.7287823,0 26.5,6.66120275 26.5,14.8001594 Z M2.5,14.8001594 C2.5,18.0978578 3.35630335,20.5402912 5.50868313,23.5355445 C5.52719928,23.5613116 7.45112679,26.0422944 8.30657284,27.1640812 C8.3765299,27.2558499 8.3765299,27.2558499 8.44645166,27.3476997 C9.55271803,28.8014241 10.3631867,29.9029307 10.8139652,30.5815314 C11.4897184,31.5988082 12.1031817,32.6194663 12.6736251,33.6787945 C13.1630732,34.1070685 13.8369268,34.1070685 14.326375,33.6787944 C14.8968182,32.6194666 15.5102815,31.5988085 16.1860348,30.5815314 C16.6368133,29.9029307 17.4472819,28.8014241 18.5535483,27.3476997 C18.6234701,27.2558499 18.6234701,27.2558499 18.6934271,27.1640812 C19.5488733,26.0422943 21.4728008,23.5613115 21.4913169,23.5355444 C23.6436967,20.5402912 24.5,18.0978578 24.5,14.8001594 C24.5,7.70712432 19.5553889,2 13.5,2 C7.44461108,2 2.5,7.70712431 2.5,14.8001594 Z'

const buildMarkerSvg = (color: string, borderColor: string, difficulty: number) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 36">
    <path data-name="Background" fill="${color}" d="${BG_PATH}"/>
    <path data-name="Border" fill="${borderColor}" d="${BORDER_PATH}"/>
    <circle data-name="Marker label background" fill="#FFFFFF" opacity="0.85" cx="13.5" cy="13.5" r="7.5"/>
    ${DIFFICULTY_SVG[difficulty]}
  </svg>`

const buildDualBorderMarkerSvg = (
  color: string,
  outerColor: string,
  innerColor: string,
  difficulty: number
) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 36">
    <path data-name="Background" fill="${color}" d="${BG_PATH}" stroke="${innerColor}" stroke-width="1.5"/>
    <path data-name="Border" fill="${outerColor}" d="${BORDER_PATH}"/>
    <circle data-name="Marker label background" fill="#FFFFFF" opacity="0.75" cx="13.5" cy="13.5" r="7.5"/>
    ${DIFFICULTY_SVG[difficulty]}
  </svg>`

export const createMarkerIcons = (
  map: React.RefObject<maplibregl.Map | null>,
  onComplete?: () => void
) => {
  if (!map.current) return

  let iconsLoaded = 0
  let callbackFired = false

  const addIconsWhenReady = () => {
    const currentMap = map.current
    if (!currentMap) return

    const getBorderSuffix = (borderColor: string): string => {
      switch (borderColor) {
        case '#8b5cf6':
          return 'selected' // Purple - popup selected
        case '#22c55e':
          return 'bundled' // Green - bundled tasks
        case '#f59e0b':
          return 'primary' // Amber - primary task
        case '#eab308':
          return 'lasso' // Yellow - lasso selected
        default:
          return 'selected'
      }
    }

    const createMarkerIcon = (
      status: string,
      color: string,
      difficulty: number,
      borderColor?: string,
      suffixOverride?: string
    ) => {
      const iconName = borderColor
        ? `marker-pin-${status}-${difficulty}-${suffixOverride ?? getBorderSuffix(borderColor)}`
        : `marker-pin-${status}-${difficulty}`

      // Skip if icon already exists - no need to recreate
      try {
        if (currentMap.hasImage(iconName)) {
          return
        }
      } catch {
        // Map may be in invalid state - skip
        return
      }

      const icon = new Image(27 * PIXEL_RATIO, 36 * PIXEL_RATIO)
      const pinSvg = buildMarkerSvg(color, borderColor ?? '#000000', difficulty)

      icon.src = `data:image/svg+xml;base64,${btoa(pinSvg)}`
      icon.onload = () => {
        // Capture map reference at load time to avoid stale closure
        const mapInstance = map.current
        if (!mapInstance) return
        try {
          if (!mapInstance.hasImage(iconName)) {
            mapInstance.addImage(iconName, icon, { pixelRatio: PIXEL_RATIO })
            iconsLoaded++
            if (onComplete && iconsLoaded >= 20 && !callbackFired) {
              // Trigger callback once after some icons are ready
              callbackFired = true
              onComplete()
            }
          }
        } catch {
          // Map may be destroyed or style not loaded - ignore
        }
      }
    }

    // Create dual-border marker icon (for bundled + selected state)
    const createDualBorderMarkerIcon = (
      status: string,
      color: string,
      difficulty: number,
      outerColor: string,
      innerColor: string,
      suffix: string
    ) => {
      const iconName = `marker-pin-${status}-${difficulty}-${suffix}`

      // Skip if icon already exists - no need to recreate
      try {
        if (currentMap.hasImage(iconName)) {
          return
        }
      } catch {
        // Map may be in invalid state - skip
        return
      }

      const icon = new Image(27 * PIXEL_RATIO, 36 * PIXEL_RATIO)
      const pinSvg = buildDualBorderMarkerSvg(color, outerColor, innerColor, difficulty)

      icon.src = `data:image/svg+xml;base64,${btoa(pinSvg)}`
      icon.onload = () => {
        const mapInstance = map.current
        if (!mapInstance) return
        try {
          if (!mapInstance.hasImage(iconName)) {
            mapInstance.addImage(iconName, icon, { pixelRatio: PIXEL_RATIO })
            iconsLoaded++
          }
        } catch {
          // Map may be destroyed or style not loaded - ignore
        }
      }
    }

    Object.entries(STATUS_CONFIG).forEach(([status, { color }]) => {
      Object.keys(DIFFICULTY_SVG).forEach((diffKey) => {
        const difficulty = Number(diffKey)

        // Normal marker
        createMarkerIcon(status, color, difficulty)

        // Selected marker with purple border (popup selected)
        createMarkerIcon(status, color, difficulty, '#8b5cf6')

        // Bundled marker with green border
        createMarkerIcon(status, color, difficulty, '#22c55e')

        // Primary marker with amber border
        createMarkerIcon(status, color, difficulty, '#f59e0b')

        // Hovered marker with green border (backward compatibility for other pages)
        createMarkerIcon(status, color, difficulty, '#22c55e', 'hovered')

        // Lasso selected marker with yellow border
        createMarkerIcon(status, color, difficulty, '#eab308')

        // Bundled + selected marker (dual border: purple outer, green inner)
        createDualBorderMarkerIcon(
          status,
          color,
          difficulty,
          '#8b5cf6',
          '#22c55e',
          'bundled-selected'
        )

        // Primary + selected marker (dual border: purple outer, amber inner)
        createDualBorderMarkerIcon(
          status,
          color,
          difficulty,
          '#8b5cf6',
          '#f59e0b',
          'primary-selected'
        )

        // Lasso + selected marker (dual border: purple outer, yellow inner)
        createDualBorderMarkerIcon(
          status,
          color,
          difficulty,
          '#8b5cf6',
          '#eab308',
          'lasso-selected'
        )
      })
    })

    const createOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      borderColor?: string,
      borderWidth = 4
    ) => {
      // Skip if icon already exists - no need to recreate
      try {
        if (currentMap.hasImage(iconName)) {
          return
        }
      } catch {
        // Map may be in invalid state - skip
        return
      }

      // Use same size as TaskPin (32x44) and dark blue color
      const icon = new Image(32 * PIXEL_RATIO, 44 * PIXEL_RATIO)
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
        if (!mapInstance) return
        try {
          if (!mapInstance.hasImage(iconName)) {
            mapInstance.addImage(iconName, icon, { pixelRatio: PIXEL_RATIO })
          }
        } catch {
          // Map may be destroyed or style not loaded - ignore
        }
      }
    }

    // Create dual-border overlap icon (for bundled + selected state)
    const createDualBorderOverlapIcon = (
      taskCount: number | string,
      iconName: string,
      outerColor: string,
      innerColor: string
    ) => {
      // Skip if icon already exists - no need to recreate
      try {
        if (currentMap.hasImage(iconName)) {
          return
        }
      } catch {
        // Map may be in invalid state - skip
        return
      }

      const icon = new Image(32 * PIXEL_RATIO, 44 * PIXEL_RATIO)
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
        if (!mapInstance) return
        try {
          if (!mapInstance.hasImage(iconName)) {
            mapInstance.addImage(iconName, icon, { pixelRatio: PIXEL_RATIO })
          }
        } catch {
          // Map may be destroyed or style not loaded - ignore
        }
      }
    }

    for (let taskCount = 2; taskCount <= 20; taskCount++) {
      // Normal overlap marker
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}`)

      // Popup selected with purple border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-selected`, '#8b5cf6', 3)

      // Bundled with green border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-bundled`, '#22c55e', 3)

      // Primary with amber border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-primary`, '#f59e0b', 3)

      // Hovered with green border (backward compatibility for other pages)
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-hovered`, '#22c55e', 3)

      // Lasso selected with yellow border
      createOverlapIcon(taskCount, `marker-overlap-${taskCount}-lasso`, '#eab308', 3)

      // Bundled + selected with dual border (purple outer, green inner)
      createDualBorderOverlapIcon(
        taskCount,
        `marker-overlap-${taskCount}-bundled-selected`,
        '#8b5cf6',
        '#22c55e'
      )

      // Primary + selected with dual border (purple outer, amber inner)
      createDualBorderOverlapIcon(
        taskCount,
        `marker-overlap-${taskCount}-primary-selected`,
        '#8b5cf6',
        '#f59e0b'
      )

      // Lasso + selected with dual border (purple outer, yellow inner)
      createDualBorderOverlapIcon(
        taskCount,
        `marker-overlap-${taskCount}-lasso-selected`,
        '#8b5cf6',
        '#eab308'
      )
    }

    // "Many" overlap markers (20+)
    createOverlapIcon('20+', 'marker-overlap-many')
    createOverlapIcon('20+', 'marker-overlap-many-selected', '#8b5cf6', 3)
    createOverlapIcon('20+', 'marker-overlap-many-bundled', '#22c55e', 3)
    createOverlapIcon('20+', 'marker-overlap-many-primary', '#f59e0b', 3)
    createOverlapIcon('20+', 'marker-overlap-many-hovered', '#22c55e', 3)
    createOverlapIcon('20+', 'marker-overlap-many-lasso', '#eab308', 3)
    createDualBorderOverlapIcon('20+', 'marker-overlap-many-bundled-selected', '#8b5cf6', '#22c55e')
    createDualBorderOverlapIcon('20+', 'marker-overlap-many-primary-selected', '#8b5cf6', '#f59e0b')
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
