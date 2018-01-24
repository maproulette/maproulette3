import { connect } from 'react-redux'
import { editTask, closeEditor } from '../../../services/Editor/Editor'

const mapStateToProps = state => ({
  editor: state.openEditor,
})

const mapDispatchToProps = dispatch => ({
  editTask: (editor, task, mapBounds) => dispatch(editTask(editor, task, mapBounds)),
  closeEditor: () => dispatch(closeEditor()),
})

const WithEditor =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithEditor
