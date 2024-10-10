import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _take from 'lodash/take'
import WithFeatured from '../../components/HOCs/WithFeatured/WithFeatured'
import WithStartChallenge
       from '../../components/HOCs/WithStartChallenge/WithStartChallenge'
import CardChallenge from '../../components/CardChallenge/CardChallenge'
import CardProject from '../../components/CardProject/CardProject'
import messages from './Messages'

export class Featured extends Component {
  browseControl = (featuredItem, itemType) => {
    return (
      <Link
        to={{
          pathname: `/browse/${itemType}/${featuredItem.id}`,
          state: { fromSearch: true },
        }}
        className="mr-button mr-button--small"
      >
        <FormattedMessage {...messages.browseFeaturedLabel} />
      </Link>
    )
  }

  render() {
    const projectCards = _take(this.props.featuredProjects, 3).map(project =>
      <CardProject
        key={project.id}
        {...this.props}
        className="mr-card-project--featured mr-mb-4"
        project={project}
        isExpanded
        permanentlyExpanded
        startControl={this.browseControl(project, "projects")}
      />
    )

    const challengeCards = _take(this.props.featuredChallenges, 6 - projectCards.length).map(challenge =>
      <CardChallenge
        key={challenge.id}
        {...this.props}
        className="mr-card-challenge--featured mr-mb-4"
        challenge={challenge}
        isExpanded
        permanentlyExpanded
        startControl={this.browseControl(challenge, "challenges")}
      />
    )

    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-highway">
        <header className="mr-text-center mr-mb-12 md:mr-mb-20">
          <h2 className="md:mr-text-5xl mr-text-white mr-font-normal">
            <FormattedMessage {...messages.featuredHeader} />
          </h2>
        </header>
        <div className="mr-max-w-3xl mr-mx-auto mr-grid md:mr-grid-columns-2 lg:mr-grid-columns-3 md:mr-grid-gap-4 xl:mr-grid-gap-8">
          {projectCards}
          {challengeCards}
        </div>
      </section>
    )
  }
}

export default WithStartChallenge(WithFeatured(Featured))
