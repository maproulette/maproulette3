import _each from 'lodash/each'
import _toPairs from 'lodash/toPairs'
import WithSearchExecution
       from '../../../HOCs/WithSearchExecution/WithSearchExecution'

/**
 * WithComboSearchExecution combines together multiple WithSearchExecution HOCs
 * for the same wrapped component, allowing a single search query to easily be
 * used for multiple discrete searches (e.g. searching both projects and
 * challenges simultaneously for a given name entered in a search box).
 *
 * @param searches {object} containing searchName: searchFunction fields for
 *        each desired search.
 *
 * @see See WithSearchExecution
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithComboSearchExecution = (WrappedComponent, searches) => {
  let Combo = WrappedComponent

  _each(_toPairs(searches), searchConfig =>
    Combo = WithSearchExecution(Combo, searchConfig[0], searchConfig[1])
  )

  return Combo
}

export default WithComboSearchExecution
