import messages from './Messages'

const overpassTurboShortcutRegex = /{{2}[^}]+}{2}/

/**
 * Provides methods related to validating Overpass queries.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsValidatableOverpass {
  constructor(overpassQuery) {
    this.overpassQuery = overpassQuery
  }

  /**
   * Validate the raw Overpass query. This just looks for a few basic problems,
   * such as inclusion of Overpass Turbo query shortcuts (mustache tags).
   */
  validate() {
    const errors = []

    if (overpassTurboShortcutRegex.test(this.overpassQuery)) {
      errors.push({
        message: messages.noOverpassTurboShortcuts
      })
    }

    return errors
  }
}

export default overpassQuery => new AsValidatableOverpass(overpassQuery)
