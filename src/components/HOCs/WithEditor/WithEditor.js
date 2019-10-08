import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import { editTask, closeEditor, loadObjectsIntoJOSM,
         josmHost, isJosmEditor, DEFAULT_EDITOR }
       from '../../../services/Editor/Editor'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithEditor provides an editor prop to its WrappedComponent that contains the
 * current open editor (if any) from the redux store and the user's currently
 * configured editor (or the system default editor if none is configured), as
 * well as functions for interacting with editors
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithEditor =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const mapStateToProps = state => {
  const userId = _get(state, 'currentUser.userId')
  const userEntity = _get(state, `entities.users.${userId}`)

  return ({
    editor: state.openEditor,
    configuredEditor: _get(userEntity, 'settings.defaultEditor', DEFAULT_EDITOR),
  })
}

export const mapDispatchToProps = dispatch => {
  return Object.assign({
    loadObjectsIntoJOSM: (objectIds, asNewLayer) => {
      return loadObjectsIntoJOSM(objectIds, asNewLayer).then(success => {
        if (!success) {
          dispatch(addError(AppErrors.josm.noResponse))
        }
      })
    },
    isJosmEditor,
    josmHost,
  }, bindActionCreators({
    editTask,
    closeEditor,
  }, dispatch))
}

export default WithEditor
