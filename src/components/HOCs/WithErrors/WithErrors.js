import { connect } from 'react-redux'
import { addError, removeError, clearErrors } from '../../../services/Error/Error'

export const mapStateToProps = (state, ownProps) => {
  return ({errors: state.currentErrors})
}

export const mapDispatchToProps = dispatch => {
  return {
    addError: error => dispatch(addError(error)),
    removeError: error => dispatch(removeError(error)),
    clearErrors: () => dispatch(clearErrors()),
  }
}

const WithErrors =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithErrors
