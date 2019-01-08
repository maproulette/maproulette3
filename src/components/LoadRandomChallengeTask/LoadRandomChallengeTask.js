import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { loadRandomTaskFromChallenge } from '../../services/Task/Task'
import BusySpinner from '../BusySpinner/BusySpinner'

const _LoadRandomChallengeTask = class extends Component {
  componentDidMount() {
    const challengeId = parseInt(_get(this.props, 'match.params.challengeId'), 10)

    if (_isFinite(challengeId)) {
      this.props.loadRandomTaskFromChallenge(challengeId)
        .then(task => {
          if (_isFinite(_get(task, 'id'))) {
            this.props.history.replace(
                  `/challenge/${challengeId}/task/${task.id}`)
          }
          else {
            this.props.history.push('/browse/challenges')
          }
        })
        .catch(error => {
          this.props.history.push(`/browse/challenges/${challengeId}`)
        })
    }
  }

  render() {
    return <BusySpinner />
  }
}

_LoadRandomChallengeTask.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  loadRandomTaskFromChallenge: PropTypes.func.isRequired,
}

const mapDispatchToProps = (dispatch) => ({
  loadRandomTaskFromChallenge: challengeId =>
    dispatch(loadRandomTaskFromChallenge(challengeId)),
})

const LoadRandomChallengeTask =
  connect(null, mapDispatchToProps)(_LoadRandomChallengeTask)

export default LoadRandomChallengeTask
