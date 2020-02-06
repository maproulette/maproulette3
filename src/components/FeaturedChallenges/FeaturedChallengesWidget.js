import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import WithFeatured from '../HOCs/WithFeatured/WithFeatured'
import QuickWidget from '../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FeaturedChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
}

export default class FeaturedChallengesWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className="featured-challenges-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <FeaturedList {...this.props} />
      </QuickWidget>
    )
  }
}

const FeaturedList = function(props) {
  const projectItems =
    _compact(_map(props.featuredProjects, project => {
      if (!_isFinite(_get(project, 'id'))) {
        return null
      }

      return (
        <li key={`project_${project.id}`} className="mr-pb-1">
          <Link to={`/browse/projects/${project.id}`}>
            {project.displayName || project.name}
          </Link>
          <span className="mr-text-grey-light mr-text-xs mr-uppercase mr-ml-2">
            <FormattedMessage {...messages.projectIndicatorLabel} />
          </span>
        </li>
      )
    }
  ))

  const challengeItems =
    _compact(_map(props.featuredChallenges, challenge => {
      if (!_isFinite(_get(challenge, 'id'))) {
        return null
      }

      return (
        <li key={`challenge_${challenge.id}`} className="mr-pb-1">
          <Link to={`/browse/challenges/${challenge.id}`}>
            {challenge.name}
          </Link>
        </li>
      )
    }
  ))

  const featuredItems = projectItems.concat(challengeItems)

  return featuredItems.length > 0 ?
         <ol className="mr-list-reset">{featuredItems}</ol> :
         <div className="none">
           <FormattedMessage {...messages.nothingFeatured} />
         </div>
}

registerWidgetType(WithFeatured(FeaturedChallengesWidget), descriptor)
