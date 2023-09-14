import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _compact from 'lodash/compact'
import _clone from 'lodash/clone'
import _findIndex from 'lodash/findIndex'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import { Link } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { boundsWithinAllowedMaxDegrees }
       from '../../../services/MapBounds/MapBounds'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithSortedChallenges from '../../HOCs/WithSortedChallenges/WithSortedChallenges'
import WithPagedChallenges from '../../HOCs/WithPagedChallenges/WithPagedChallenges'
import WithFeatured from '../../HOCs/WithFeatured/WithFeatured'
import ChallengeResultItem from '../ChallengeResultItem/ChallengeResultItem'
import ProjectResultItem from '../ProjectResultItem/ProjectResultItem'
import PageResultsButton from './PageResultsButton'
import messages from './Messages'
import './ChallengeResultList.scss'

const limitUserResults = (challenges) => {
  const ownerLimit = Number(process.env.REACT_APP_BROWSE_CHALLENGES_OWNER_LIMIT);

  if (ownerLimit) {
    const userDictionary = {};

    const limitedChallenges = challenges.filter(challenge => {
      const { owner } = challenge;
  
      if (userDictionary[owner]) {
        userDictionary[owner]++;
        if (userDictionary[owner] > ownerLimit) {
          return false;
        }
      } else {
        userDictionary[owner] = 1;
      }
  
      return true;
    });
  
    return limitedChallenges;
  }

  return challenges;
}

/**
 * ChallengeResultList applies the current challenge filters and the given
 * search to the given challenges, displaying the results as a list of
 * ChallengeResultItems.
 *
 * @see See ChallengeResultItem
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeResultList extends Component {
  constructor(props) {
    super(props)
    this.listRef = React.createRef()
    this.state = { data: null }
  }

  async fetchData(query) {
    await fetch(`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/task/${query}`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ data : responseJson })
    })
    .catch((error) => {
      this.setState({ data : null })
      console.error(error);
    })
  }  

  render() {
    const challengeResultsUnbound = _clone(this.props.pagedChallenges);
    const challengeResults = this.props.location?.pathname?.includes("browse/challenges") 
      && (this.props.searchSort?.sortBy === "created"
          || _isEmpty(this.props.searchSort) 
          || this.props.location.search.includes("default"))
        ? limitUserResults(challengeResultsUnbound)
        : challengeResultsUnbound;

    const isFetching = _get(this.props, 'fetchingChallenges', []).length > 0

    const search = _get(this.props, 'currentSearch.challenges', {})
    const searchType = this.props.searchFilters.searchType
    const bounds = _get(search, 'mapBounds.bounds')
    const locationFilter = _get(search, 'filters.location')
    const otherFilters = _omit(search.filters, ['location'])
    const unfiltered =
      _isEmpty(search.query) &&
      _isEmpty(otherFilters) &&
      (_isEmpty(locationFilter) || !bounds || !boundsWithinAllowedMaxDegrees(bounds))

    const query = search.query ? search.query : this.props.searchFilters.project ? this.props.searchFilters.project : this.props.searchFilters.task 

    let matchedId = []
    if(!isNaN(query) && query) {
      if(this.props.searchFilters.searchType == "projects"){
        matchedId = _filter(this.props.unfilteredChallenges, (item) => item.parent.id.toString() === query.toString());
      } else {
        matchedId = _filter(this.props.unfilteredChallenges, (item) => item.id.toString() === query.toString());
      }
    }

    // If no filters are applied, inject any featured projects
    if (unfiltered && this.props.featuredProjects.length > 0) {
      // Try to locate them right above any featured challenges in the results
      let featuredIndex = _findIndex(challengeResults, {featured: true})
      if (featuredIndex === -1) {
        // No featured challenges. If no sorting is in play, inject at top (after any
        // saved challenges, if present)
        if (_isEmpty(_get(search, 'sort.sortBy'))) {
          const savedChallenges = _get(this.props, 'user.savedChallenges', [])
          featuredIndex =
            _findIndex(challengeResults, result => _findIndex(savedChallenges, {id: result.id}) === -1)
        }
      }
      if (featuredIndex !== -1) {
        challengeResults.splice(featuredIndex, 0, ...this.props.featuredProjects)
      }
    }

    let detectedIds = null;

    if (searchType === "task" && query && isNaN(query)) {
      detectedIds = (
        <div className="mr-text-white mr-text-lg mr-pt-4">
          <span>
            <FormattedMessage {...messages.invalidId} />
          </span>
        </div>
      );
    }
    
    if (!isNaN(query) && query) {
      // Filters for Task Id
      if (searchType === "task") {
        this.fetchData(query);
        let matchedChallengeId = null;
        
        if (this.state.data) {
          matchedChallengeId = _filter(this.props.unfilteredChallenges, (item) =>
            item.id.toString() === this.state.data.parent.toString()
          );
        }
      
        if (matchedChallengeId && matchedChallengeId.length > 0) {
          detectedIds = (
            <div>
              <div className="mr-text-white mr-text-lg mr-pt-4">
                <FormattedMessage {...messages.goTo} />
                <Link
                  to={`/challenge/${this.state.data.parent}/task/${this.state.data.id}`}
                  className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
                >
                  <div className="mr-border mr-border-white mr-text-green-lighter mr-text-lg mr-p-2 mr-mt-2">
                    <FormattedMessage {...messages.task} /> {`${this.state.data.id}`}
                  </div>
                </Link>
                <div>
                  <div className="mr-pt-4 mr-pb-2">
                    <FormattedMessage {...messages.locatedIn} />
                    <FormattedMessage {...messages.challenge} />
                    {this.state.data.parent}
                  </div>
                  <ChallengeResultItem
                    key={`challenge_${this.state.data.parent}`}
                    {...this.props}
                    challenge={matchedChallengeId[0]}
                    listRef={this.listRef}
                    sort={search?.sort}
                  />
                </div>
              </div>
            </div>
          );
        } else {
          detectedIds = (
            <div className="mr-text-white mr-text-lg mr-pt-4">
              <span>
                <FormattedMessage {...messages.doesntExist} />
              </span>
            </div>
          );
        }      
      } else if (matchedId.length === 0) {
        detectedIds = (
          <div className="mr-text-white mr-text-lg mr-pt-4">
            <span>
              <FormattedMessage {...messages.noChallengeIds} />
            </span>
          </div>
        );
      // Filters for Challenge Id
      } else if (searchType === undefined || searchType === "challenges") {
        detectedIds = (
          <div>
            <FormattedMessage {...messages.challenge} />
            {matchedId[0].id}
            <ChallengeResultItem
              key={`challenge_${matchedId[0].id}`}
              {...this.props}
              challenge={matchedId[0]}
              listRef={this.listRef}
              sort={search?.sort}
            />
          </div>
        );
      // Filters for Project Id
      } else if (searchType === "projects") {
        detectedIds = (
          <div>
            <FormattedMessage {...messages.project} />
            {matchedId[0].parent.id} {_compact(_map(matchedId, (item) => (
              <ProjectResultItem
                key={`project_${item.id}`}
                {...this.props}
                project={item}
                listRef={this.listRef}
              />
            )))}
          </div>
        );
      }
    }
    
    
    let results = null
    if (challengeResults.length === 0) {
      if (!isFetching) {
        results = (
          <div className="mr-text-white mr-text-lg mr-pt-4">
            <span>
              <FormattedMessage {...messages.noResults} />
            </span>
          </div>
        )
      }
    } else {
      results = _compact(_map(challengeResults, result => {
        if (result.parent) {
          return (
            <ChallengeResultItem
              key={`challenge_${result.id}`}
              {...this.props}
              className="mr-mb-4"
              challenge={result}
              listRef={this.listRef}
              sort={search?.sort}
            />
          )
        }
        else if (!this.props.excludeProjectResults) {
          return (
            <ProjectResultItem
              key={`project_${result.id}`}
              {...this.props}
              className="mr-mb-4"
              project={result}
              listRef={this.listRef}
            />
          )
        }
        else {
          return null
        }
      }))
    }
  
    return (
      <div
        ref={this.listRef}
        className="mr-relative lg:mr-w-sm lg:mr-pr-6 lg:mr-mr-2 mr-mb-6 lg:mr-mb-0 lg:mr-rounded lg:mr-h-challenges lg:mr-overflow-auto"
      >
        {detectedIds ? (
          <div>
            {detectedIds}
            <div
              className={`mr-border mr-border-white ${
                matchedId && results
                  ? "mr-mt-6 mr-mb-6"
                  : matchedId
                  ? "mr-mt-6"
                  : !results
                  ? "mr-mb-6"
                  : "mr-mt-4 mr-mb-6"
              }`}
            />
          </div>
        ) : null}
        {results}

        <div className="after-results">
          <PageResultsButton
            {...this.props}
            isLoading={this.props.isLoading || isFetching}
          />
        </div>
      </div>
    )
  }
}

ChallengeResultList.propTypes = {
  /**
   * Candidate challenges to which any current filters, search, etc. should be
   * applied
   */
  unfilteredChallenges: PropTypes.array.isRequired,

  /** Remaining challenges after all filters, searches, etc. applied */
  challenges: PropTypes.array.isRequired,

  /** Remaining challenges after challenges have been paged */
  pagedChallenges: PropTypes.array.isRequired,
}

export default
  WithCurrentUser(
    WithFeatured(
      WithSortedChallenges(
        WithPagedChallenges(injectIntl(ChallengeResultList), 'challenges', 'pagedChallenges')
      ),
      { excludeChallenges: true } // just featured projects; we already get challenges
    )
  )
