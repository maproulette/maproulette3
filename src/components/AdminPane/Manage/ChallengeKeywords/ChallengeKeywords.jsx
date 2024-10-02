import { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'

/**
 * ChallengeKeywords renders the keywords of the given challenge as a tag set.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeKeywords extends Component {
  render() {
    if (!this.props.challenge) {
      return null
    }

    const keywords = _compact(_map(this.props.challenge.tags, keyword => {
      if (_isEmpty(keyword)) {
        return null
      }

      return <span className="mr-bg-white-10 mr-text-white mr-mr-2 mr-mb-2 mr-py-1 mr-px-2 mr-rounded" key={keyword}>{keyword}</span>
    }))

    return (
      <div
        className={classNames("mr-flex mr-flex-wrap", this.props.className)}
      >
        {keywords}
      </div>
    )
  }
}

ChallengeKeywords.propTypes = {
  challenge: PropTypes.object,
}
