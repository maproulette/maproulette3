import { createRef, Component } from 'react'
import PropTypes from 'prop-types'
import _isEqual from 'lodash/isEqual'
import { injectIntl } from 'react-intl'
import CardProject from '../../CardProject/CardProject'

/**
 * ProjectResultItem represents a single challenge result in a ChallengeResultList.
 * It includes status icons to indicate if that challenge is featured or has
 * been saved/bookmarked by the user, a description of the challenge, and controls
 * to start working on the challenge, save the challenge, etc., and a progress bar
 * showing completion status of the challenge's tasks.
 *
 * > Note that if a null user is provided, a SignIn control will be shown instead of
 * > the usual start and save controls.
 *
 * @see See [ChallengeResultList](#challengeresultlist)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ProjectResultItem extends Component {
  constructor(props) {
    super(props)
    this.itemRef = createRef()
  }

  shouldComponentUpdate(nextProps) {
    // Only re-render under specific conditions:

    // if the user has changed
    if ((nextProps?.user?.id) !== (this.props.user?.id)) {
      return true
    }

    // if the project object itself changed
    if (!_isEqual(nextProps.project, this.props.project)) {
      return true
    }

    return false
  }

  /**
   * Invoke to begin browsing this project
   *
   * @private
   */
  browseProject = () => {
    this.props.history.push(
      `/browse/projects/${this.props.project.id}`,
      { fromSearch: true }
    )
  }

  render() {
    return (
      <div ref={this.itemRef}>
        <CardProject
          className="mr-mb-4"
          project={this.props.project}
          isExpanded={false}
          cardClicked={this.browseProject}
          projectQuery={this.props.searchFilters?.project}
          excludeProjectId={this.props.excludeProjectId}
        />
      </div>
    );
  }
}

ProjectResultItem.propTypes = {
  /** The current, logged-in user or null if the user is not signed in */
  user: PropTypes.object,
  /** The project represented by this item */
  project: PropTypes.object.isRequired,
}

export default injectIntl(ProjectResultItem)
