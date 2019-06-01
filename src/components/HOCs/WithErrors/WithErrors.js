import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addError, addErrorWithDetails, removeError, clearErrors }
       from '../../../services/Error/Error'

export const mapStateToProps = (state, ownProps) => {
  return ({errors: state.currentErrors})
}

export const mapDispatchToProps = dispatch => bindActionCreators({
  addError,
  addErrorWithDetails,
  removeError,
  clearErrors,
}, dispatch)

const WithErrors =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithErrors
