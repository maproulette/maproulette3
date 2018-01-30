import { connect } from 'react-redux'
import { editTask, closeEditor } from '../../../services/Editor/Editor'

/**
 * WithEditor provides an editor prop to its WrappedComponent that contains the
 * current open editor (if any) from the redux store, as well as functions for
 * initiating and ending editing of a task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithEditor =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const mapStateToProps = state => ({
  editor: state.openEditor,
})

export const mapDispatchToProps = dispatch => ({
  editTask: (editor, task, mapBounds) => dispatch(editTask(editor, task, mapBounds)),
  closeEditor: () => dispatch(closeEditor()),
})

export default WithEditor
