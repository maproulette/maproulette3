import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _take from 'lodash/take'
import _isObject from 'lodash/isObject'
import WithFeaturedChallenges
       from '../../components/HOCs/WithFeaturedChallenges/WithFeaturedChallenges'
import WithStartChallenge
       from '../../components/HOCs/WithStartChallenge/WithStartChallenge'
import CardChallenge from '../../components/CardChallenge/CardChallenge'
import SignInButton from '../../components/SignInButton/SignInButton'
import messages from './Messages'

export class FeaturedChallenges extends Component {
  startControl = (challenge) => {
    // Users need to be signed in to start a challenge
    if (!_isObject(this.props.user)) {
      return <SignInButton {...this.props} longForm className='' />
    }

    return (
      <Link
        to={{}}
        className="mr-button mr-button--small"
        onClick={() => this.props.startChallenge(challenge)}
      >
        <FormattedMessage {...messages.startChallenge} />
      </Link>
    )
  }

  render() {

    const challengeCards = _take(this.props.featuredChallenges, 3).map(challenge =>
      <CardChallenge
        key={challenge.id}
        {...this.props}
        className="mr-card-challenge--featured mr-mb-4"
        challenge={challenge}
        isExpanded
        permanentlyExpanded
        startControl={this.startControl(challenge)}
      />
    )

    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-no-repeat mr-bg-center mr-bg-cover mr-bg-featured-challenges">
        <header className="mr-text-center mr-mb-12 md:mr-mb-20">
          <h2 className="md:mr-text-5xl mr-text-white mr-font-normal">Featured Challenges</h2>
        </header>
        <div className="mr-max-w-3xl mr-mx-auto mr-grid md:mr-grid-columns-2 lg:mr-grid-columns-3 md:mr-grid-gap-4 xl:mr-grid-gap-8">
          {challengeCards}
        </div>
      </section>
    )
  }
}

export default WithStartChallenge(WithFeaturedChallenges(FeaturedChallenges))
