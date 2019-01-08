import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import { fetchVirtualChallenge }
       from '../../../services/VirtualChallenge/VirtualChallenge'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

const FRESHNESS_THRESHOLD = 5000 // 5 seconds

const WithVirtualChallenge = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedVirtualChallenge(WrappedComponent))

/**
 * WithLoadedVirtualChallenge is a private HOC used to fetch an up-to-date copy of the task
 * and parent challenge from the server.
 *
 * @private
 */
const WithLoadedVirtualChallenge = function(WrappedComponent) {
  return class extends Component {
    loadNeededVirtualChallenge = props => {
      if (_isFinite(props.virtualChallengeId)) {
        props.loadVirtualChallenge(props.virtualChallengeId)
      }
    }

    componentDidMount() {
      this.loadNeededVirtualChallenge(this.props)
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.virtualChallengeId !== this.props.virtualChallengeId) {
        this.loadNeededVirtualChallenge(nextProps)
      }
    }

    render() {
      // We don't need to pass anything down. WithVirtualChallenge grabs the latest
      // from the redux store, which is where our updated copy will end up.
      return <WrappedComponent {..._omit(this.props, 'loadVirtualChallenge')} />
    }
  }
}

export const mapStateToProps = (state, ownProps) => {
  const mappedProps = {virtualChallenge: null}

  const virtualChallengeId = virtualChallengeIdFromRoute(ownProps, ownProps.virtualChallengeId)
  if (_isFinite(virtualChallengeId)) {
    mappedProps.virtualChallengeId = virtualChallengeId
    mappedProps.virtualChallenge =
      _get(state, `entities.virtualChallenges.${virtualChallengeId}`)
  }

  return mappedProps
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * For the WithLoadedVirtualChallenge private HOC.
     *
     * @private
     */
    loadVirtualChallenge: _debounce(virtualChallengeId => {
      return dispatch(
        fetchVirtualChallenge(virtualChallengeId)
      ).then(results => {
        if (!results.result ||
            results.entities.virtualChallenges[results.result].expiry < Date.now()) {
          dispatch(addError(AppErrors.virtualChallenge.expired))
          ownProps.history.push('/browse/challenges')
        }
      })
    }, FRESHNESS_THRESHOLD),
  }
}

/**
 * Retrieve the virtual challenge id from the route, falling back to the given
 * defaultId if none is available.
 */
export const virtualChallengeIdFromRoute = (props, defaultId) => {
  const virtualChallengeId =
    parseInt(_get(props, 'match.params.virtualChallengeId'), 10)

  return _isFinite(virtualChallengeId) ? virtualChallengeId : defaultId
}

export default WithVirtualChallenge
