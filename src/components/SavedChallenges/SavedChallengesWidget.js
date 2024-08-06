import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import _isPlainObject from 'lodash/isPlainObject'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import QuickWidget from '../QuickWidget/QuickWidget'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'SavedChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export class SavedChallengesWidget extends Component {
  componentDidMount() {
    if (this.props.user && this.props.fetchSavedChallenges) {
      this.props.fetchSavedChallenges(this.props.user.id)
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="saved-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <SavedChallengeList {...this.props} />
      </QuickWidget>
    )
  }
}

const SavedChallengeList = function(props) {
  const challengeItems =
    _compact(_map(_get(props, 'user.savedChallenges', []), challenge => {
      if (!_isFinite(_get(challenge, 'id'))) {
        return null
      }

      return (
        <li
          key={challenge.id}
          className="mr-py-2 mr-flex mr-justify-between mr-items-center"
        >
          <div className="mr-flex mr-flex-col">
            <Link to={`/browse/challenges/${challenge.id}`}>
              {challenge.name}
            </Link>
            {_isPlainObject(challenge.parent) && // virtual challenges don't have projects
              <div className="mr-links-grey-light">
                <Link
                  onClick={e => {e.stopPropagation()}}
                  to={`/browse/projects/${challenge.parent.id}`}
                >
                  {challenge.parent.displayName || challenge.parent.name}
                </Link>
              </div>
            }
          </div>
          <div className="mr-h-5">
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={dropdown => (
                <button
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center mr-text-white-40"
                >
                  <SvgSymbol
                    sym="navigation-more-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5"
                  />
                </button>
              )}
              dropdownContent={() =>
                <ul className="mr-list-dropdown mr-links-green-lighter">
                  <li>
                    <a onClick={() => props.startChallenge(challenge)}>
                      <FormattedMessage {...messages.startChallenge} />
                    </a>
                  </li>
                  <li>
                    <a onClick={() => props.unsaveChallenge(props.user.id, challenge.id)}>
                      <FormattedMessage {...messages.unsave} />
                    </a>
                  </li>
                </ul>
              }
            />
          </div>
        </li>
      )
    }
  ))

  
  return (
    challengeItems.length > 0 ?
    <ol className="mr-list-reset mr-links-green-lighter mr-pb-24">
      {challengeItems}
    </ol> :
    <div className="mr-text-grey-lighter">
      <FormattedMessage {...messages.noChallenges} />
    </div>
  )
}

const WrappedWidget = WithStartChallenge(SavedChallengesWidget)

registerWidgetType(WrappedWidget, descriptor)
export default WrappedWidget
