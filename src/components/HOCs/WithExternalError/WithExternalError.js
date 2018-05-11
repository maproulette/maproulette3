import React, { Component } from 'react'
import { connect } from 'react-redux'
import queryString from 'query-string'
import _omit from 'lodash/omit'
import { addError } from '../../../services/Error/Error'

/**
 * WithExternalError generates an error on mount passed via `errormsg` query
 * string param in the URL, causing an error modal to be immediately displayed.
 * This component is intended to be used to wrap landing pages that may receive
 * external errors (e.g. during an oauth failure). This should *not* be used
 * for displaying errors within the app -- use the error service for that.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithExternalError = function(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      const params = queryString.parse(this.props.location.search)

      if (params.errormsg) {
        this.props.addExternalError(params.errormsg)
      }
      else {
        this.props.addExternalError("An unknown error occurred.")
      }
    }

    render() {
      return <WrappedComponent {..._omit(this.props, 'addExternalError')} />
    }
  }
}

const mapDispatchToProps = dispatch => ({
  addExternalError: message => {
    dispatch(addError({id: "Errors.external", defaultMessage: message}))
  }
})

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithExternalError(WrappedComponent))
