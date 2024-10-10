import { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import AsBrowsableChallenge
       from '../../interactions/Challenge/AsBrowsableChallenge'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import ShareLink from '../ShareLink/ShareLink'
import { constructChallengeLink } from '../../utils/constructChangesetUrl'

/**
 * ChallengeNameLink displays a linked name of the parent challenge of the
 * given task, along with a share link.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeNameLink extends Component {
  render() {
    const challenge = _get(this.props.task, 'parent') || this.props.challenge || {}
    const project = _get(this.props.task, 'parent.parent') || this.props.project || {}
    const challengeBrowseRoute = AsBrowsableChallenge(challenge).browseURL()
    const challengeShareLink = constructChallengeLink(challenge?.id)

    return (
      <span className="mr-flex mr-items-baseline mr-relative mr-overflow-hidden">
        {_isFinite(this.props.virtualChallengeId) &&
         <span title={_get(this.props, 'virtualChallenge.name')}>
           <Link
             to={`/browse/virtual/${this.props.virtualChallengeId}`}
             className="mr-leading-normal mr-flex mr-items-baseline"
           >
             {_get(this.props, 'virtualChallenge.name') ?
              <span className="mr-text-white hover:mr-text-green-lighter">
                {this.props.virtualChallenge.name}
              </span> :
              <BusySpinner inline />
             }
             <SvgSymbol
               sym="shuffle-icon"
               viewBox="0 0 20 20"
               className="mr-fill-turquoise mr-w-4 mr-h-4 mr-mx-4"
             />
           </Link>
         </span>
        }
        <div className="mr-flex mr-flex-col">
          <span title={challenge.name}>
            <Link to={challengeBrowseRoute}>
              <span className="mr-mr-2">
                {challenge.name}
              </span>
            </Link>
          </span>
          {this.props.includeProject &&
           <div className="mr-text-xs mr-links-green-lighter mr-mt-1">
             <Link to={`/browse/projects/${project.id}`}>
               {project.displayName}
             </Link>
           </div>
          }
        </div>
        {!this.props.suppressShareLink &&
         <ShareLink link={challengeShareLink} {...this.props} />
        }
      </span>
    )
  }
}

ChallengeNameLink.propTypes = {
  task: PropTypes.object,
}
