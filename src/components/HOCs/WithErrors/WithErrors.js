import { connect } from 'react-redux'
import { buildError, addError, removeError, clearErrors } from '../../../services/Error/Error'

export const mapStateToProps = (state, ownProps) => {
  return ({errors: state.currentErrors})
}

export const mapDispatchToProps = dispatch => {
  return {
    buildError,
    addError: error => dispatch(addError(error)),
    removeError: error => dispatch(removeError(error)),
    clearErrors: () => dispatch(clearErrors()),
  }
}

const WithErrors =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithErrors
