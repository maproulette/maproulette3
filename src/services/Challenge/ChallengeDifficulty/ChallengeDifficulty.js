import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _isNumber from 'lodash/isNumber'
import messages from './Messages'

// These constants are defined on the server
export const CHALLENGE_DIFFICULTY_EASY = 1
export const CHALLENGE_DIFFICULTY_NORMAL = 2
export const CHALLENGE_DIFFICULTY_EXPERT = 3

export const ChallengeDifficulty = Object.freeze({
  easy: CHALLENGE_DIFFICULTY_EASY,
  normal: CHALLENGE_DIFFICULTY_NORMAL,
  expert: CHALLENGE_DIFFICULTY_EXPERT,
})

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByDifficulty = _fromPairs(
  _map(messages, (message, key) => [ChallengeDifficulty[key], message])
)

/** Returns object containing localized labels  */
export const difficultyLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

export const challengePassesDifficultyFilter = function(filter, challenge, props) {
  if (_isNumber(filter.difficulty)) {
    return challenge.difficulty === filter.difficulty
  }

  return true
}
